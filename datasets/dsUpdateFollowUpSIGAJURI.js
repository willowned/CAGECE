function createDataset(fields, constraints, sortFields) {
	var dsUpdateFollowUpSIGAJURI = DatasetBuilder.newDataset();
	dsUpdateFollowUpSIGAJURI.addColumn("retorno");
	
	var sFollowUp = "";
	var sStatus   = "";
	var sObsExec  = "";
	var sDocs     = "";
	var sFilial   = "";
	var sMailExecutor = "";
	
	var retorno = true;
	
	for (var i = 0; i < constraints.length; i++){
		if (constraints[i].initialValue !=null){
			if (constraints[i].fieldName == "sFollowUp"){
				sFollowUp = constraints[i].initialValue;
			} else if (constraints[i].fieldName == "sStatus"){
				sStatus = constraints[i].initialValue;			
			} else if (constraints[i].fieldName == "sDocs"){
				sDocs = constraints[i].initialValue;
			} else if (constraints[i].fieldName == "sObsExec"){
				sObsExec = constraints[i].initialValue;
			} else if (constraints[i].fieldName == "sFilial"){
				sFilial = constraints[i].initialValue;
			} else if (constraints[i].fieldName == "sMailExecutor"){
				sMailExecutor = constraints[i].initialValue;
			}
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
		
		var TimeOut = "600000" //Tempo de espera do Fluig em milissegundos 10 minutos
		var properties = {};		  
		properties["receive.timeout"] = TimeOut;
		properties["basic.authorization"] = "true"; // Ativar autenticação básica
		properties["basic.authorization.username"] = sUserAuth; // Usuário para autenticar
		properties["basic.authorization.password"] = sPassAuth; // Senha para autenticar
		  
		var customClient = service.getCustomClient(UpdFUService, "wsfluigjuridico.sigajuri.totvs.com.WSFLUIGJURIDICOSOAP", properties);
		   
		retorno = customClient.mtjursyncfollowup(sFollowUp, sStatus, sObsExec, sDocs, sFilial, sMailExecutor);
		  
		dsUpdateFollowUpSIGAJURI.addRow(new Array(retorno));
	  
	}
	catch(e){
		log.error("*** dsUpdateFollowUpSIGAJURI - ERRO: " + e.message);
		dsUpdateFollowUpSIGAJURI.addRow(new Array(e.message));
	}
	
	return dsUpdateFollowUpSIGAJURI;
}