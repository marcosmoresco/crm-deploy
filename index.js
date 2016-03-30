#!/usr/bin/env node

var program = require('commander'),
  shell = require('shelljs'),
  glob = require("glob"),
  fs = require('fs'),
  log4js = require('log4js'),
  logger = log4js.getLogger(),
  xml2js = require('xml2js'),
  parser = new xml2js.Parser(),
  Services = require('./modules/services');

program
  .version('v0.0.1')
  .option('-a, --all', 'All files of configuration IDP, DATABASE, LOG4J...')
  .option('-f, --file <file>', 'The especific option, ex: -f IDP')
  .option('-p, --profile <profile>', 'The especific profile, ex: -p DEV')
  .option('-b, --build', 'Build Big Bang')
  .option('-m, --module <module>...', 'Build especific module(s)')
  .option('-d, --download <download>...', 'Download sources especific module(s)')
  .option('-w, --web', 'Build crm-web')
  .option('-s, --symbolic', 'Execute symbolic link for plugins')
  .option('-u, --update', 'Update autocomplete modules')
  .option('-r, --run', 'Run tomcat')
  .parse(process.argv);


/*jslint evil: true */
for (var i = 0; i < process.argv.length; i++) {
  for (var j = 0; j < program.options.length; j++) {
    if (process.argv[i] === program.options[j].short || process.argv[i] === program.options[j].long) {
      if (program.options[j].long !== '--profile') {
        eval(program.options[j].long.replace('--', ''))();
      }
      break;
    }
  }
}

function all() {
  if (!!program.all) {
    if (!!program.profile) {
      //Get profile and issuer
      var res = Services.getProfileAndIssuer(program.profile);

      //Create symbolic link bundles
      logger.debug("create symbolic link bundles");
      shell.exec('ln -sf ' + (process.env.ALGARCRM_WORKSPACE + '/source/environment-conf/' + res.profile + '/bundles ') + process.env.CATALINA_HOME);

      //Create symbolic link security
      logger.debug("create symbolic link security");
      shell.exec('ln -sf ' + (process.env.ALGARCRM_WORKSPACE + '/source/environment-conf/' + res.profile + '/security ') + process.env.CATALINA_HOME);

      //Edit catalina.sh
      Services.editCatalina(res.issuerIdp);

      //Edit metadata_sp.xml
      Services.editMetadata(res.profile, res.issuerIdp);

    } else {
      return logger.error("Enter Profile, ex: -p DEV");
    }
  }
}

function file() {
  if (!!program.file) {
    if (!!program.profile) {

      var res = Services.getProfileAndIssuer(program.profile);

      if (program.file.toUpperCase() === 'IDP') {

        //Create symbolic link security
        logger.debug("create symbolic link security");
        shell.exec('ln -sf ' + (process.env.ALGARCRM_WORKSPACE + '/algarcrm/source/environment-conf/' + res.profile + '/security ') + process.env.CATALINA_HOME);

        //Edit catalina.sh
        Services.editCatalina(res.issuerIdp);

        //Edit metadata_sp.xml
        Services.editMetadata(res.profile, res.issuerIdp);
      }
    } else {
      return logger.error("Enter Profile, ex: -p DEV");
    }

  }
}

function build() {
  if (!!program.build) {
    shell.cd(process.env.ALGARCRM_WORKSPACE + '/source');
    shell.exec('mvn clean install -Dmaven.test.skip -nsu -Dnpm.skip');
  }
}

function module() {
  if (!!program.module) {
    var modules = [],
      args = !!process.argv ? process.argv.slice(process.argv.indexOf("-m") + 1) : [];

    findOption:
      for (var ii = 0; ii < args.length; ii++) {
        for (var j = 0; j < program.options.length; j++) {
          if (args[ii] === program.options[j].short || args[ii] === program.options[j].long) {
            break findOption;
          }
        }
        modules.push(args[ii]);
      }

    for (var i = 0; i < modules.length; i++) {
      var checkExistModule = shell.exec('[ -d ' + process.env.ALGARCRM_WORKSPACE + '/source/modules/' + modules[i] + ' ]').code;
      if (checkExistModule === 0) {
        logger.info('Build module : ' + modules[i]);
        shell.cd(process.env.ALGARCRM_WORKSPACE + '/source/modules/' + modules[i]);
        shell.exec('mvn clean install -Dmaven.test.skip -nsu -Dnpm.skip');
      } else {
        var checkExistPlugin = shell.exec('[ -d ' + process.env.ALGARCRM_WORKSPACE + '/source/plugins/' + modules[i] + ' ]').code;
        if (checkExistPlugin === 0) {
          logger.info('Build plugin : ' + modules[i]);
          shell.cd(process.env.ALGARCRM_WORKSPACE + '/source/plugins/' + modules[i]);
          shell.exec('mvn clean install -Dmaven.test.skip -nsu -Dnpm.skip');
        } else {
          logger.error('Module or Plugin : ' + modules[i] + ', not exist in the paths : [ "' + process.env.ALGARCRM_WORKSPACE + '/source/modules/"' +
            ' , "' +
            process.env.ALGARCRM_WORKSPACE + '/source/plugins/" ]');
        }
      }
    }
  }
}

function download() {
  if (!!program.download) {
    var modules = [],
      args = !!process.argv ? process.argv.slice(process.argv.indexOf("-d") + 1) : [];

    findOption:
      for (var ii = 0; ii < args.length; ii++) {
        for (var j = 0; j < program.options.length; j++) {
          if (args[ii] === program.options[j].short || args[ii] === program.options[j].long) {
            break findOption;
          }
        }
        modules.push(args[ii]);
      }

    for (var i = 0; i < modules.length; i++) {
      var checkExistModule = shell.exec('[ -d ' + process.env.ALGARCRM_WORKSPACE + '/source/modules/' + modules[i] + ' ]').code;
      if (checkExistModule === 0) {
        logger.info('Download sources of module : ' + modules[i]);
        shell.cd(process.env.ALGARCRM_WORKSPACE + '/source/modules/' + modules[i]);
        shell.exec('mvn eclipse:eclipse -DdownloadSources=true -DdownloadJavadocs=true');
      } else {
        var checkExistPlugin = shell.exec('[ -d ' + process.env.ALGARCRM_WORKSPACE + '/source/plugins/' + modules[i] + ' ]').code;
        if (checkExistPlugin === 0) {
          logger.info('Download sources of plugin : ' + modules[i]);
          shell.cd(process.env.ALGARCRM_WORKSPACE + '/source/plugins/' + modules[i]);
          shell.exec('mvn eclipse:eclipse -DdownloadSources=true -DdownloadJavadocs=true');
        } else {
          logger.error('Module or Plugin : ' + modules[i] + ', not exist in the paths : [ "' + process.env.ALGARCRM_WORKSPACE + '/source/modules/"' +
            ' , "' +
            process.env.ALGARCRM_WORKSPACE + '/source/plugins/" ]');
        }
      }
    }
  }
}

//Build crm-web
function web() {
  if (!!program.web) {
    shell.cd(process.env.ALGARCRM_WORKSPACE + '/source/algarcrm-all/crm-web');
    shell.exec('mvn clean install -Dmaven.test.skip -nsu');
  }
}


function updateComplete() {

  var list = [],
    options = {};

  glob(process.env.ALGARCRM_WORKSPACE + '/source/plugins/*/', options, function(err, files) {

    //var args = process.argv.slice(2);
    if (err) {
      return logger.error(err);
    }

    for (var i = 0; i < files.length; i++) {
      var re = /plugins\/(.*)\//;
      list.push(re.exec(files[i])[1]);
    }

    glob(process.env.ALGARCRM_WORKSPACE + '/source/modules/*/', options, function(err, files) {

      //var args = process.argv.slice(2);
      if (err) {
        return logger.error(err);
      }

      for (var i = 0; i < files.length; i++) {
        var re = /modules\/(.*)\//;
        list.push(re.exec(files[i])[1]);
      }

      var str = '"';
      for (var j = 0; j < list.length; j++) {
        str += ' ' + list[j];
      }
      str += ' " ';

      Services.readFile('/etc/bash_completion.d/crm-deploy').then(function(file) {
        var regex = /-W[\S\s](.*)--/;

        var replacer = function(match, p1, offset, string) {
          return match.replace(p1, str);
        };

        var newFile = file.replace(regex, replacer);

        Services.save(newFile, '/etc/bash_completion.d/crm-deploy');

        shell.exec('. /etc/bash_completion.d/crm-deploy');

      });

    });
  });
}

function update() {
  updateComplete();
}
//Check if createSymbolic
function symbolic() {
  if (!!program.symbolic) {
    shell.cd(process.env.ALGARCRM_WORKSPACE + '/source/pluginsdeploy');
    shell.exec('./symbolic_link.sh');
  }
}

function run() {
  if (!!program.run) {
    var startup = "sh " + process.env.CATALINA_HOME + '/bin/catalina.sh jpda run',
      stop = "sh " + process.env.CATALINA_HOME + '/bin/shutdown.sh',
      kill = "pkill -9 -f tomcat";

    shell.exec(kill, function() {
      shell.exec(startup);
    });

  }
}
