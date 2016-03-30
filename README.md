# crm-deploy

## Installation
    $ git checkout https://github.com/marcosmoresco/crm-deploy.git
    $ cd crm-deploy		
    $ npm install crm-deploy -g

## Version

    $ crm-deploy --version 	
  
## Configuration
 
Set environment ALGARCRM_WORKSPACE to find folders algarcrm

    $ export ALGARCRM_WORKSPACE=/home/username/workspace/algarcrm

Set environment CATALINA_HOME for your tomcat

    $ export CATALINA_HOME=/opt/apache-tomcat-7.0.50

## Examples
  
Alter all configutations( IDP, DATABASE, RULES-ENGINE ... ) for HOM

    $ crm-deploy -a -p hom

Compile modules sales-model and sales		
  
    $ crm-deploy -m sales-model sales

Run Tomcat
	
    $ crm-deploy -r

Alter configurations and run tomcat

    $ crm-deploy -a -p hom -r
 		 	 	  	
