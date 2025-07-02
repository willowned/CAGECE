function createDataset(fields, constraints, sortFields) {
	// Dataset para recuperar os escritórios cadastrados no SIGAJURIS via Webservice (NS7).
	
	var dsFilial = DatasetBuilder.newDataset();
	dsFilial.addColumn("id");
	dsFilial.addColumn("Filial");
	
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
		
		var AssJur = authBasicService.mtescritorios();
		var Dados = AssJur.getDADOS().getSTRUDADOS();
		
		dsFilial.addRow(new Array("-", "-"));
		
		for(var i = 0; i < Dados.size(); i++){
			dsFilial.addRow(new Array(Dados.get(i).getCODIGO(), Dados.get(i).getDESCRICAO().trim()));
		}	
	}
	catch(e){
		dsFilial.addRow(new Array("", e.message));
	}
	
	return dsFilial;
}