function createDataset(fields, constraints, sortFields) {
	var dsFollowupSIGAJURI = DatasetBuilder.newDataset();
	dsFollowupSIGAJURI.addColumn("cdFollowup");
	
	var cdWF;
	var dtPrazoTarefa;
	var cdTipoOrigem;
	var cdCodOrigem;
	var sDescricao;
	var cdCajuri;
	var sCampoRetorno;
	var sStepDestino;
	var sStepDestinoFalha;
	var sSolicitante;
	var cdFilialNS7;
		
	var retorno = "0";
	
	for (var i = 0; i < constraints.length; i++){
		if (constraints[i].fieldName == "cdWF"){
			cdWF = constraints[i].initialValue;
		} else if (constraints[i].fieldName == "dtPrazoTarefa"){
			dtPrazoTarefa = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "sDescricao"){
			sDescricao = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "cdCajuri"){
			cdCajuri = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "cdTipoOrigem"){
			cdTipoOrigem = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "sCampoRetorno"){
			sCampoRetorno = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "sStepDestino"){
			sStepDestino = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "sStepDestinoFalha"){
			sStepDestinoFalha = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "cdCodOrigem"){
			cdCodOrigem = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "sSolicitante"){
			sSolicitante = constraints[i].initialValue;			
		} else if (constraints[i].fieldName == "cdFilialNS7"){
			cdFilialNS7 = constraints[i].initialValue;			
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
		var IncConsService = serviceLocator.getWSFLUIGJURIDICOSOAP();
		var authBasicService = serviceHelper.getBasicAuthenticatedClient(IncConsService, sUserAuth, sPassAuth);
		
		var aDados = serviceHelper.instantiate('wsfluigjuridico.sigajuri.totvs.com.STRUFOLLOWUP');
		aDados.setSOLICITACAO(cdWF);
		aDados.setDESCRICAO(sDescricao);
		aDados.setDATAFW(dtPrazoTarefa);
		aDados.setCAMPORETORNO(sCampoRetorno);
		aDados.setSTEPDESTINO(sStepDestino);
		aDados.setSTEPDESTINOFALHA(sStepDestinoFalha);
		aDados.setCODASSUNTOJURIDICO(cdCajuri);
		aDados.setORIGEM(cdTipoOrigem);
		aDados.setCODORIGEM(cdCodOrigem);
		aDados.setSOLICITANTE(sSolicitante);
		aDados.setESCRITORIO(cdFilialNS7);
		
		retorno = authBasicService.mtjurincfollowup(aDados);
		
		dsFollowupSIGAJURI.addRow(new Array(retorno));
	}
	catch(e){
		log.error("*** dsFollowupSIGAJURI - Erro ao gerar um Follow-up no SIGAJURI: " + e.message);
		dsFollowupSIGAJURI.addRow(new Array("0"));
	}
	
	return dsFollowupSIGAJURI;
}