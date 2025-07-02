function createDataset(fields, constraints, sortFields) {
	var dsGeraMinutaSIGAJURI = DatasetBuilder.newDataset();
	dsGeraMinutaSIGAJURI.addColumn("id_peticao");
	
	var cdCajuri	= "";
	var cdTipoCon	= "";
	var cdPeticao	= "";
	var cdFilialNS7	= "";
	var cdTipoImpr  = "W";
	
	for (var i = 0; i < constraints.length; i++){
		if (constraints[i].fieldName == "cdCajuri"){
			cdCajuri = constraints[i].initialValue;
		} else if (constraints[i].fieldName == "cdTipoCon"){
			cdTipoCon = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "cdFilialNS7"){
			cdFilialNS7 = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "sTipoImpr"){
			cdTipoImpr  = constraints[i].initialValue;
		}
	}
	
	try{
		// Parâmetros para Autenticação básica
		var dsParamsSIGAJURI = DatasetFactory.getDataset("dsParamsSIGAJURI", new Array(), new Array(), null);
        var sUserAuth = dsParamsSIGAJURI.getValue(0,"sUserAuth");
	    var sPassAuth = dsParamsSIGAJURI.getValue(0,"sPassAuth");

		var service = ServiceManager.getService('SIGAJURI');
		var serviceHelper = service.getBean();
		var serviceLocator = serviceHelper.instantiate('wsfluigjuridico.sigajuri.totvs.com.WSFLUIGJURIDICO');
		var UpdFUService = serviceLocator.getWSFLUIGJURIDICOSOAP();
		var authBasicService = serviceHelper.getBasicAuthenticatedClient(UpdFUService, sUserAuth, sPassAuth);
		
		cdPeticao = authBasicService.mtgeraminuta(cdCajuri, cdTipoCon, cdFilialNS7, cdTipoImpr);
		
		dsGeraMinutaSIGAJURI.addRow(new Array(cdPeticao));
	}
	catch(e){
		log.error("*** dsGeraMinutaSIGAJURI - Não foi possível realizar a operação de geração de minutas automáticas: " + (e.message));
		dsGeraMinutaSIGAJURI.addRow(new Array("0"));
	}
	
	return dsGeraMinutaSIGAJURI;
}