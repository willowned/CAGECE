function enableFields(form){ 
	var INICIO = 1;
	var APROVAFU = 2;
	var APROVACAO = 6;
	var EXECUCAO = 4;
	var APROVAFU2 = 11;
	var EXECUTADO = 16;
	
	var step = parseInt(getValue("WKNumState"));
	var fields = new Array();
	
	switch(step){
	case 0:
	case INICIO:
	case APROVAFU:
	case APROVAFU2:
	case EXECUTADO:
		break;
	case APROVACAO:
		fields.push("sObsAprovador");
		break;
	case EXECUCAO:
		fields.push("sObsExecutor");
		break;
	}
	
	disableAllFields(form);
	enableSelectedFields(form, fields);
}

function disableAllFields(form) {
	var fields = form.getCardData();
	var iterator = fields.keySet().iterator();
	while (iterator.hasNext()) {
		var curField = iterator.next();
		form.setEnabled(curField, false);
	}
}

function enableSelectedFields(form, fields) {
	for (var i = 0; i < fields.length; i++) {
		form.setEnabled(fields[i], true);
	}
}