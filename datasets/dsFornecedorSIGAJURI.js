function createDataset(fields, constraints, sortFields) {
	// Dataset para recuperar os fornecedores cadastrados no SIGAJURI via Webservice (SA2).
	
	var dsFornecedor = DatasetBuilder.newDataset();
	dsFornecedor.addColumn("id");
	dsFornecedor.addColumn("Razao_Social");
	dsFornecedor.addColumn("Nome_Fantasia");
	dsFornecedor.addColumn("Cnpj");
	
	var cFiltro = "";
	var cEscritorio = "";
	
	for (var i = 0; i < constraints.length; i++){			
		if (constraints[i].fieldName == "Razao_Social"){
			cFiltro = constraints[i].initialValue;
		} 
		if (constraints[i].fieldName == "Escritorio"){
			cEscritorio = constraints[i].initialValue;
		}
		console.log("constraints: " + constraints[i].fieldName + "|" + constraints[i].initialValue);
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
		
		var Empresa = authBasicService.mtfornecedores(cFiltro, cEscritorio);
		var Dados = Empresa.getSTRUEMPRESA();
		
		for(var i = 0; i < Dados.size(); i++){
			dsFornecedor.addRow(new Array(Dados.get(i).getCODIGO(), Dados.get(i).getRAZAOSOCIAL().trim(), Dados.get(i).getNOMEFANTASIA().trim(), Dados.get(i).getCNPJ().trim()));
		}	
	}
	catch(e){
		dsFornecedor.addRow(new Array("", e.message));
	}
	
	return dsFornecedor;
}