function createDataset(fields, constraints, sortFields) {
	// Dataset para recuperar os Grupos do Fluig. Criado para contornar um problema do produto que ocorre ao montar a query SQL de alguns datasets internos padrao.
	
	var dsAnexos = DatasetBuilder.newDataset();
	dsAnexos.addColumn("id");
	dsAnexos.addColumn("Desc");																					
	dsAnexos.addColumn("FiltExtensao");
	dsAnexos.addColumn("PastaCaso");
	
	try{
		var sPastaCaso = "";
		var sFiltExtensao = "";
		var bInclui = true;
		var sNomeArquivo = "";
		var arrExtensaoFilt = new Array();
		
		for (var i = 0; i < constraints.length; i++){
			if (constraints[i].fieldName == "PastaCaso"){
				sPastaCaso = constraints[i].initialValue;
			} else if (constraints[i].fieldName == "FiltExtensao"){
				sFiltExtensao = constraints[i].initialValue;
			}
		}
		
		if (sFiltExtensao.search(';') >= 0){
			arrExtensaoFilt = sFiltExtensao.split(';')
		} else {
			arrExtensaoFilt = [sFiltExtensao]
		}
		
		//Monta as constraints para consulta
	    var c1 = DatasetFactory.createConstraint("activeVersion", "true", "true", ConstraintType.MUST);
	    var c3 = DatasetFactory.createConstraint("parentDocumentId", sPastaCaso, sPastaCaso, ConstraintType.MUST);
	    var c4 = DatasetFactory.createConstraint("documentType", "2", "2", ConstraintType.MUST);
	    
	    var constraints   = new Array(c1, c3, c4);
	    
	    //Define os campos para ordenação
	    var sortingFields = new Array("documentPK.documentId");
	    
	    //Busca o dataset
	    var dataset = DatasetFactory.getDataset("document", null, constraints, sortingFields);
	    var requestData = new Array();
	    
	    for(var i = 0; i < dataset.rowsCount; i++) {
	    	sNomeArquivo = dataset.getValue(i, "documentDescription").toString();
	    	
	    	for (var c = 0; c < arrExtensaoFilt.length; c++ ){
	    		if ((sNomeArquivo.toLowerCase().search(arrExtensaoFilt[c].toLowerCase()) >= 0)){
	    			requestData = new Array(dataset.getValue(i, "documentPK.documentId"),
							sNomeArquivo);
	    			dsAnexos.addRow(requestData);
	    			break;
	    		}
	    	}
		}
	}
	catch(e){
		dsAnexos.addRow(new Array("0", e.message));
	}
    return dsAnexos;	
}
		