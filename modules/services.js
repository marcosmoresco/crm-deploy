var fs = require('fs'),
  log4js = require('log4js'),
  logger = log4js.getLogger(),
  xml2js = require('xml2js'),
  parser = new xml2js.Parser();


readFile = function(filename, enc) {
  return new Promise(function(fulfill, reject) {
    fs.readFile(filename, !!enc ? enc : 'utf8', function(err, res) {
      if (err) reject(err);
      else fulfill(res);
    });
  });
};

save = function(file, filePath) {

  try {
    fs.writeFileSync(filePath, file, 'utf8');
    logger.debug("The file [ " + filePath + " ] was saved!");
  } catch (err) {
    return logger.error(err);
  }
  /*
  return new Promise(function(fulfill, reject) {
    fs.writeFile(filePath, file, function(err) {
      if (err) reject(err);
      else {
        logger.debug("The file [ " + filePath + " ] was saved!");
        fulfill(true);
      }
    });
  }); */
};

editMetadata = function(profile, issuerIdp) {
  readFile(process.env.ALGARCRM_WORKSPACE + '/source/environment-conf/' + profile + '/security/metadata_sp.xml').then(function(file) {
    parser.parseString(file, function(err, result) {

      //Check if use after
      var reEntityId = /entityID="(.*)">/,
        reSingle = /<md:SingleLogoutService(?:[\s\S]*?)Location="(.*?|\n)"/,
        reConsumer = /<md:AssertionConsumerService(?:[\s\S]*?)Location="(.*?|\n)/;

      result['md:EntityDescriptor'].$.entityID = issuerIdp;

      locationSingleLogoutService = 'http://localhost:8080/crm/saml/SingleLogout/alias/' + issuerIdp;

      result['md:EntityDescriptor']['md:SPSSODescriptor'][0]['md:SingleLogoutService'][0].$.Location = locationSingleLogoutService;

      locationAssertionConsumerService = 'http://localhost:8080/crm/saml/SSO/alias/' + issuerIdp;

      result['md:EntityDescriptor']['md:SPSSODescriptor'][0]['md:AssertionConsumerService'][0].$.Location = locationAssertionConsumerService;

      var builder = new xml2js.Builder({
        xmldec: {
          encoding: 'UTF-8',
          standalone: false
        }
      });

      var xml = builder.buildObject(result);

      this.save(xml, process.env.ALGARCRM_WORKSPACE + '/source/environment-conf/' + profile + '/security/metadata_sp.xml');
    });
  });
};


editCatalina = function(issuerIdp) {
  //Save catalina.sh
  readFile(process.env.CATALINA_HOME + '/bin/catalina.sh').then(function(file) {
    //Regex get issuer
    var re = /(?:-Dsaml.issuer=)(.*)[""]/g;

    var replacer = function(match, p1, offset, string) {
      return match.replace(p1, issuerIdp);
    };

    var newFile = file.replace(re, replacer);

    save(newFile, process.env.CATALINA_HOME + '/bin/catalina.sh');

  });
};


getProfileAndIssuer = function(object) {

  var result = {};

  if (object.toUpperCase() === 'DEV') {
    result.issuerIdp = 'algarCRMDev';
    result.profile = 'dev';
  } else if (object.toUpperCase() === 'TIT' || object.toUpperCase() === 'HOM') {
    result.issuerIdp = 'algarCRMLocal';
    result.profile = object.toLowerCase();
  } else {
    return logger.error("Error profile invalid. Valids profiles DEV, TIT and HOM ");
  }
  return result;
};

this.save = save;
this.readFile = readFile;
this.editMetadata = editMetadata;
this.editCatalina = editCatalina;
this.getProfileAndIssuer = getProfileAndIssuer;
module.exports = this;
