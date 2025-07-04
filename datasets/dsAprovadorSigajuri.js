function createDataset(fields, constraints, sortFields) {
	//Dataset que ira retornar o e-mail do aprovador a partir dos participantes do processo VIA Webservice (NSZ).
	
	var dsAprovador = DatasetBuilder.newDataset();
	dsAprovador.addColumn("sEmailAprovador");
	
	var cFilial = "";
	var cCodAssJur = "";
	var cCampoApro = "";
	var cEmailApro = "";
	
	for (var i = 0; i < constraints.length; i++){
		if (constraints[i].fieldName == "sFilial"){
			cFilial = constraints[i].initialValue;
		} else if (constraints[i].fieldName == "sCajuri"){
			cCodAssJur = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "cdAprovadorSIGAJURI"){
			cCampoApro = constraints[i].initialValue;
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
		var AssJurService = serviceLocator.getWSFLUIGJURIDICOSOAP();
		var authBasicService = serviceHelper.getBasicAuthenticatedClient(AssJurService, sUserAuth, sPassAuth);
		
		//cEmailApro = AssJurService.mtAprovadorSigajuri(cFilial, cCodAssJur, cCampoApro);
		cEmailApro = authBasicService.mtaprovadorsigajuri(cFilial, cCodAssJur, cCampoApro);
		
		dsAprovador.addRow(new Array(cEmailApro));
	}
	catch(e){
		log.info("*** dsAprovadorSigajuri - Não foi possível recuperar o e-mail do aprovador: " + (e.message));
		dsAprovador.addRow(new Array("", e.message));
	}
	
	log.info("*** dsAprovadorSigajuri - E-MAIL RETORNADO DO SIGAJURI: " + cEmailApro);
	
	return dsAprovador;
}