function createDataset(fields, constraints, sortFields) {
	// Dataset para recuperar os Tipos de Contrato do SIGAJURI via Webservice. 
	
	var dsTipoSol = DatasetBuilder.newDataset();
	dsTipoSol.addColumn("id");
	dsTipoSol.addColumn("TipoSol");
	
	try{
		// Parâmetros para Autenticação básica
		var dsParamsSIGAJURI = DatasetFactory.getDataset("dsParamsSIGAJURI", new Array(), new Array(), null);
        var sUserAuth = dsParamsSIGAJURI.getValue(0,"sUserAuth");
	    var sPassAuth = dsParamsSIGAJURI.getValue(0,"sPassAuth");

		var service = ServiceManager.getService('SIGAJURI');
		var serviceHelper = service.getBean();
		var serviceLocator = serviceHelper.instantiate('wsfluigjuridico.sigajuri.totvs.com.WSFLUIGJURIDICO');
		var TipoSolService = serviceLocator.getWSFLUIGJURIDICOSOAP();
		var authBasicService = serviceHelper.getBasicAuthenticatedClient(TipoSolService, sUserAuth, sPassAuth);
		
		var TipoSol = authBasicService.mttipossolicitacao();
		var Dados = TipoSol.getDADOS().getSTRUDADOS();
		
		for(var i = 0; i < Dados.size(); i++){
			dsTipoSol.addRow(new Array(Dados.get(i).getCODIGO(), Dados.get(i).getDESCRICAO().trim()));
		}	
	}
	catch(e){
		dsTipoSol.addRow(new Array("", e.message));
	}
	
	return dsTipoSol;
}