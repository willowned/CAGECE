function displayFields(form,customHTML){
	customHTML.append("<script>");
	// Variáveis de formulário - https://tdn.totvs.com/pages/releaseview.action?pageId=75270483
	customHTML.append("function getFormMode() { return '"+ form.getFormMode() + "'; }");

	// Variáveis de processo
	customHTML.append("function getWKNumState(){ return " + getValue("WKNumState") + "; }");
	customHTML.append("function getWKNumProcess(){ return " + getValue("WKNumProces") + "; }");
	customHTML.append("</script>");

	// Mostra os campos com os contornos no modo consulta
    form.setShowDisabledFields(true);
	var nrProcesso = getValue("WKNumProces"); //Traz o numero do Processo Aberto
	var atividade  = getValue("WKNumState"); // Verifica o ID da atividade/componente
	form.setValue('atividade_atual', atividade);
	var matricula  = getValue("WKUser"); 	  // Matricula do Usuário logado no Fluig
	var doc = getValue("WKDocument");
	var edicao     = form.getFormMode();

	//Constraints Pra pegar o Nome do Usuário logado através da Variavel Global WKUser
	var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId", matricula, matricula, ConstraintType.MUST);
	var constraints = new Array(c1);
	var usuario = DatasetFactory.getDataset("colleague", null, constraints, null);

	var data = new Date();
	var dia = ('0' + data.getDate()).slice(-2);
	var mes = ('0' + (data.getMonth() + 1)).slice(-2);
	var ano = data.getFullYear();
	var horario = data.toTimeString().split(' ')[0]
	var dataProcesso = dia + '/' + mes + '/' + ano;

	if (atividade == 0 || atividade == 4) {
		form.setValue('abertura', dataProcesso);
		form.setValue('matricula', matricula);
		form.setValue('solicitante', usuario.getValue(0, "colleagueName"));
		if ( atividade == 0 ){
			// Carrega informações gerais da solicitação somente no início
			fnDadosSolicitacao();
		}

		fnEsconderDiv(".dados-assinatura")
	}

	if (atividade == 9){
		form.setValue('rd_utilizaAssinEletr', 'Sim');
		//form.setValue('idDoc', 'doc');
	}
	if (atividade == 22 || atividade == 23 || atividade == 47){
		 var habilitar = false; // Informe True para Habilitar ou False para Desabilitar os campos
		 var mapaForm = new java.util.HashMap();
		 mapaForm = form.getCardData();
		 var it = mapaForm.keySet().iterator();

		//  while (it.hasNext()) { // Laço de repetição para habilitar/desabilitar os campos
		//     var key = it.next();		    
		//     form.setEnabled(key, habilitar);		    
        // }
		// Esconde botões de PaixFilhos
		fnEsconderDiv('.hide-paiFilho');

		customHTML.append("<script>");
		customHTML.append("$(document).ready(function(){");
		customHTML.append("bloquearCampos();");
		customHTML.append("});");
		customHTML.append("</script>");

		customHTML.append("<script>");
		customHTML.append("$(document).ready(function(){");
		customHTML.append("$('.removeServicoCons').hide();");
		customHTML.append("});");
		customHTML.append("</script>");
	}
	
	customHTML.append("<script>");
	customHTML.append("$(document).ready(function(){");
	// Chamada da função para esconder todos os botões
	if( edicao == 'VIEW' ){
		customHTML.append('showColOrdem();');
	}
	customHTML.append("});");
	customHTML.append("</script>");
	
	
	// Função para ocultar a divisão recebida como parâmetro
	function fnEsconderDiv(ocultaDiv) {
		customHTML.append("<script>");
		customHTML.append("$(document).ready(function(){");
		customHTML.append("$('" + ocultaDiv + "').hide();");
		customHTML.append("});");
		customHTML.append("</script>");
	}
	// Função para mostrar a divisão recebida como parâmetro
	function fnMostrarDiv(mostraDiv) {
		customHTML.append("$('" + mostraDiv + "').show();");
	}
	// Função para carregar informações da divisão Solicitação
	function fnDadosSolicitacao () {
		form.setValue('datAbertura', 	fnFormatarData(new Date(),'DiaMesAno'));	
		form.setValue('datAbertura_AAAAMMDD', fnFormatarData(new Date(),'AnoMesDia'));
		// Datas relativas ao Período Previsto
		form.setValue('horAbertura', 	fnFormatarHora(new Date()));
		form.setValue('matSolicFluig',  getValue('WKUser'));
		form.setValue('nomSolic', 		fnBuscarNome(getValue('WKUser')));
		form.setValue('loginSolic', 	fnBuscarLogin(getValue('WKUser')));
	}
	// Função para formatar data
	function fnFormatarData(data,formato) {
        //Retorna a data no formato dd/mm/aaaa
		var dia = ('0' + data.getDate()).slice(-2);
		var mes = ('0' + (data.getMonth() + 1)).slice(-2);
		var ano = data.getFullYear();
		if ( formato == 'DiaMesAno' ) {
			return dia + "/" + mes + "/" + ano;
		} else if ( formato == 'AnoMesDia' ) {
			return ano + mes + dia; 
		} else if ( formato == 'AnoMesDiaAmericano' ) {
			return ano +'-'+ mes +'-'+ dia; 
		}
	}
	// Função para formatar hora
    function fnFormatarHora(data) {
    	//Retorna a hora no formato hh:mm
        var hor = ('0' + data.getHours()).slice(-2);
        var min = ('0' + data.getMinutes()).slice(-2);
        return hor + ":" + min;
    }
    // Função para buscar login de um usuário a partir da matrícula no Fluig
	function fnBuscarLogin(matFluig) {
		var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId", matFluig, matFluig, ConstraintType.MUST);
		var filtro = new Array(c1);
		var dataset = DatasetFactory.getDataset("colleague", null, filtro, null);
		return dataset.getValue(0, "login");
	}
	// Função para buscar nome de um usuário a partir da matrícula no Fluig
	function fnBuscarNome(matFluig) {
		var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId", matFluig, matFluig, ConstraintType.MUST);
		var filtro = new Array(c1);
		var dataset = DatasetFactory.getDataset("colleague", null, filtro, null);
		return dataset.getValue(0, "colleagueName");
	}
	//Função para formatar data hora no formato DD/MM/YYYY HH:MM 
	function fnFormatarDataHora(date) {
		date  = new Date(date);
		options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'},
		date = date.toLocaleDateString('pt-BR', options);
		return date;
	}
	
}