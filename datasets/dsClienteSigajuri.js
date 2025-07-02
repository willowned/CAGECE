function createDataset(fields, constraints, sortFields) {
	// Dataset para recuperar os escritórios cadastrados no SIGAJURIS via Webservice (NS7).
	
	var dsCliente = DatasetBuilder.newDataset();
	dsCliente.addColumn("id");
	dsCliente.addColumn("Razao_Social");
	dsCliente.addColumn("Nome_Fantasia");
	dsCliente.addColumn("Cnpj");
	
	var cFiltro = "";
	var cEscritorio = "";
	
	for (var i = 0; i < constraints.length; i++){			
		if (constraints[i].fieldName == "Razao_Social"){
			cFiltro = constraints[i].initialValue;
		}
		if (constraints[i].fieldName == "Escritorio"){
			cEscritorio = constraints[i].initialValue;
		}
		log.info("constraints: " + constraints[i].fieldName + "|" + constraints[i].initialValue);
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
		
		var Empresa = authBasicService.mtempresas(cFiltro, cEscritorio);
		var Dados = Empresa.getSTRUEMPRESA();
		
		for(var i = 0; i < Dados.size(); i++){
			dsCliente.addRow(new Array(Dados.get(i).getCODIGO(), Dados.get(i).getRAZAOSOCIAL().trim(), Dados.get(i).getNOMEFANTASIA().trim(), Dados.get(i).getCNPJ().trim()));
		}	
	}
	catch(e){
		dsCliente.addRow(new Array("", e.message));
	}
	
	return dsCliente;
}