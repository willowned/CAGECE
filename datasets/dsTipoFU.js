function createDataset(fields, constraints, sortFields) {
	// Dataset para recuperar os Tipos de Follow-Up do SIGAJURIS via Webservice. 
	
	var dsTipoFU = DatasetBuilder.newDataset();
	dsTipoFU.addColumn("id");
	dsTipoFU.addColumn("TipoFU");
	
	try{
		// Parâmetros para Autenticação básica
		var dsParamsSIGAJURI = DatasetFactory.getDataset("dsParamsSIGAJURI", new Array(), new Array(), null);
        var sUserAuth = dsParamsSIGAJURI.getValue(0,"sUserAuth");
	    var sPassAuth = dsParamsSIGAJURI.getValue(0,"sPassAuth");

		var service = ServiceManager.getService('SIGAJURI');
		var serviceHelper = service.getBean();
		var serviceLocator = serviceHelper.instantiate('wsfluigjuridico.sigajuri.totvs.com.WSFLUIGJURIDICO');
		var TipoFUService = serviceLocator.getWSFLUIGJURIDICOSOAP();
		var authBasicService = serviceHelper.getBasicAuthenticatedClient(TipoFUService, sUserAuth, sPassAuth);
		
		var TipoFU = authBasicService.mttiposfollowup();
		var Dados = TipoFU.getDADOS().getSTRUDADOS();
		
		for(var i = 0; i < Dados.size(); i++){
			dsTipoFU.addRow(new Array(Dados.get(i).getCODIGO(), Dados.get(i).getDESCRICAO().trim()));
		}	
	}
	catch(e){
		dsTipoFU.addRow(new Array("", e.message));
	}
	
	return dsTipoFU;
}