# crm-deploy

## Installation
    $ git checkout https://github.com/marcosmoresco/crm-deploy.git
    $ cd crm-deploy		
    $ npm install crm-deploy -g

## Version

    $ crm-deploy --version 	
  
## Configuration
 
    $ export ALGARCRM_WORKSPACE=/home/username/workspace/algarcrm

Set environment ALGARCRM_WORKSPACE to find folders algarcrm   	

    $ export CATALINA_HOME=/opt/apache-tomcat-7.0.50

Set environment CATALINA_HOME for your tomcat		

## Examples
   
    $ crm-deploy -a -p hom

Alter all configutations( IDP, DATABASE, RULES-ENGINE ... ) for HOM
   
    $ crm-deploy -r

Run tomcat configuration set CATALINA_HOME

    $ crm-deploy -a -p hom -r

Alter configurations and run tomcat 		
 	 	  	
