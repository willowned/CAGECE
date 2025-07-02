var wcmFollowup = SuperWidget.extend({
	loading: null, // tela de Loading
	configFollowUp: null, // Datatable
	isDatatableBound: false,

    init: function(){
    	// soment no ViewMode
    	if(!this.isEditMode){
    		// Cria a tela de loading
	    	this.loading = FLUIGC.loading('#wcmFollowup_'+this.instanceId);
	    	
	    	// Seta as mascaras dos campos de prioridade e valor
	    	// Nota: Foi utilizada uma library de mascara diferente da padrão. Ver arquivo "mascaras.js".
	    	$('#sPrioridade_'+this.instanceId).mask('0#', {reverse: false});
	    	$('#sFaixaValTo_'+this.instanceId).mask('#.##0,00', {reverse: true});
	    	$('#sFaixaValFrom_'+this.instanceId).mask('#.##0,00', {reverse: true});
	    	
	    	// Carrega os dados das configuracoes de Follow-Up existentes na Datatable.
	    	this.updateDatatable();
	    	
	    	// Carrega os Dropdowns de Assunto Juridico e Tipos de Follow-Up
	    	this.loadDatasetValues('dsAssJur', ['id', 'AssJur'], new Array(), null);
    	}
    },

    bindings: {
        local: {
        	'open-zoom-papel': ['click_mostraZoom'],
            'open-zoom-grupo': ['click_mostraZoom'],
            'clear-zoom-grupo': ['click_clearZoom'],
            'clear-zoom-papel': ['click_clearZoom'],
            'save-button': ['click_saveFollowUp'],
            'clear-button': ['click_clearFollowUp'],
            'delete-button': ['click_deleteFollowUp'],
            'select-change': ['change_selectChange'],
            'aprovador-change': ['change_aprovadorChange'],
        }
    },
    
    /***
     * Função para carregar valores de Datasets do Fluig via AJAX, para não prender a execução. 
     * Customizada para alterar o retorno ao usuário e o tratamento dos dados com base no nome do Dataset consultado.
     * @param name Nome do Dataset a ser consultado.
     * @param fields Campos do Dataset a serem selecionados para retorno.
     * @param constraints Filtros a serem aplicados ao Dataset.
     * @param order Campos que vão determinar a ordem dos registros do Dataset.
     */
    loadDatasetValues : function(name, fields, constraints, order){
    	// salva a referencia ao objeto widget para poder utilizado de dentro das funcoes Callback.
    	var _this = this;
    	
    	// variavel contendo todos os campos de entrada para ser utilizada na chamada AJAX
    	var data = {
			"name":name,
			"fields":fields,
			"constraints":constraints,
			"order":order
		};
    	
    	// Cria uma variavel para receber o texto da tela de loading, dependendo do nome do Dataset consultado.
    	var msg = "";
    	switch (name){
    	case "dsAssJur":
    		msg = "${i18n.getTranslation('application.loading.dsAssJur')}";
    		break;
    	case "wcmSIGAJURI_FollowUp":
    		msg = "${i18n.getTranslation('application.loading.wcmSIGAJURI_FollowUp')}";
    		break;
    	case "dsSaveFollowUp":
    		msg = "${i18n.getTranslation('application.loading.dsSaveFollowUp')}";
    		break;
    	case "dsDeleteFollowUp":
    		msg = "${i18n.getTranslation('application.loading.dsDeleteFollowUp')}";
    		break;
    	default:
    		msg = "${i18n.getTranslation('application.loading.Dataset')}";
    	}
    	
    	// Mostra a tela de loading com a mensagem determinada acima.
    	this.loading.show();
    	this.loading.setMessage("<h3>" + msg + "</h3>");
    	
    	// Realiza a chamada AJAX para recuperar os registros do Dataset.
    	simpleAjaxAPI.Create({
    		url: parent.ECM.restUrl + "dataset/datasets/", // Endereço do REST para consumir Datasets.
    		data: data, // Dados utilizados na chamada ao Dataset.
    		success: function(data){ // Funcao callback de sucesso.
				_this.loading.hide(); // Esconde a tela de loading.
    			if(data != null && data.values != null && data.values.length > 0){ // Caso o resultado não seja vazio.
    				// Determinar o que fazer com os dados a partir do nome do Dataset consultado.
    				switch (name){
    				case "dsAssJur":
    					// Carregar o dropdown de Assuntos juridicos
    					_this.loadSelect(data.values, 'AssJur');
    					break;
    		    	case "wcmSIGAJURI_FollowUp":
    		    		// Carregar o Datatable de configurações de Follow-Up
    		    		_this.loadDatatable(data.values);
    		    		break;
    				case "dsSaveFollowUp":
    					// Caso o Webservice tenha retornado 'ok', gerar um Toast e limpar os campos do Widget. Caso contrário, gerar uma modal de alerta.
    					if (data.values[0]['Status']=='ok'){
	    					FLUIGC.toast({
	        			        title: "${i18n.getTranslation('application.success.Title.dsSaveFollowUp')}",
	        			        message: "${i18n.getTranslation('application.success.dsSaveFollowUp')}",
	        			        type: 'success'
	        			    });
	    		    		_this.clearSaveFollowUp();
    					} else {
    		    			FLUIGC.message.alert({
    		    			    message: data.values[0]['Status'],
    		    			    title: "${i18n.getTranslation('application.error.Title')}",
    		    			    label: "${i18n.getTranslation('application.button.Close')}"
    		    			}, function(el, ev) {
    		    			});
    					}
    					break;
    				case "dsDeleteFollowUp":
    					// Caso o Webservice tenha retornado 'ok', gerar um Toast e limpar os campos do Widget. Caso contrário, gerar uma modal de alerta.
    					if (data.values[0]['Status']=='ok'){
	    					FLUIGC.toast({
	        			        title: "${i18n.getTranslation('application.success.Title.dsDeleteFollowUp')}",
	        			        message: "${i18n.getTranslation('application.success.dsDeleteFollowUp')}",
	        			        type: 'success'
	        			    });
	    		    		_this.clearFollowUp();
    					} else {
    		    			FLUIGC.message.alert({
    		    			    message: data.values[0]['Status'],
    		    			    title: "${i18n.getTranslation('application.error.Title')}",
    		    			    label: "${i18n.getTranslation('application.button.Close')}"
    		    			}, function(el, ev) {
    		    			});
    					}
    					break;    					
    				default:
    					// Para casos de datasets genericos, gerar um Toast informando o sucesso da operacao.
    					FLUIGC.toast({
        			        title: "${i18n.getTranslation('application.warning.Title.Dataset')}",
        			        message: data.values[0].Status,
        			        type: 'success'
        			    });
    				}
    			}else{ // Caso o dataset retorne vazio, determinar qual mensagem utilizar e gerar um Toast informando a falta de registros.
    		    	var msgVazio = "${i18n.getTranslation('application.warning.Dataset')}";
    		    	var titleVazio = "${i18n.getTranslation('application.warning.Title.Dataset')}";
    		    	var typeVazio = 'warning';
    		    	switch (name){
    		    	case "dsAssJur":
    		    		msgVazio = "${i18n.getTranslation('application.warning.dsAssJur')}";
    		    		titleVazio = "${i18n.getTranslation('application.warning.Title.dsAssJur')}";
    		    		typeVazio = 'error';
    		    		break;
    		    	case "wcmSIGAJURI_FollowUp":
    		    		msgVazio = "${i18n.getTranslation('application.warning.wcmSIGAJURI')}";
    		    		titleVazio = "${i18n.getTranslation('application.warning.Title.wcmSIGAJURI')}";
    		    		typeVazio = 'info';
    		    		_this.loadDatatable(data.values);
    		    		break;
    		    	}
    				FLUIGC.toast({
    			        title: titleVazio,
    			        message: msgVazio,
    			        type: typeVazio
    			    });
    			}
    		},
    		error : function(jqXHR, textStatus, errorThrown){ // Funcao callback de falha.
    			// Esconde a tela de loading.
    			_this.loading.hide();
    			
    			// Gera um alerta com a falha ocorrida.
    			FLUIGC.message.alert({
    			    message: "${i18n.getTranslation('application.error.datasetFail')}" + errorThrown,
    			    title: "${i18n.getTranslation('application.error.Title.datasetFail')}",
    			    label: "${i18n.getTranslation('application.button.Close')}"
    			}, function(el, ev) {
    			});
    		}
    	});
	},
	
	/**
	 * Carrega os dados retornados pelo dataset na dropdown correta.
	 * @param data Retorno do Dataset consultado.
	 * @param tipoSelect Qual Select deve ser populado por essa chamada.
	 */
	loadSelect: function(data, tipoSelect){
		var select = null;
		var options = null;
		
		// Determinar qual DOM Select deve ser selecionado a partir do tipo de select foi passado e popular o valor padrão do select.
		switch (tipoSelect){
		case "AssJur":
    		select = $('#sAssuntoJuridico_'+this.instanceId);
    		options = '<option value="">' + "${i18n.getTranslation('application.placeholder.AssuntosJuridicos.StandardValue')}" + '</option>';
    		break;
    	default: return;
		}
		
		// Para cada registro retornado do Dataset, incluir uma opção no select.		
		for (var i = 0; i < data.length; i++){
			options += '<option value="' + data[i]['id'] + '">' + data[i][tipoSelect] + '</option>';
		}
		
		// seta as opções no dataset selecionado.
		select.html(options);
	},
    
	/**
	 * Função para bind do evento Change do Select.
	 * Essa função faz com que os valores do Select atuem como filtros para a Datatable, que é recarregada a cada alteração de valor nos Selects.
	 * @param el Elemento Select que disparou o evento.
	 * @param ev Objeto do evento em si.
	 */
	selectChange: function(el,ev){
		this.updateDatatable();
	},
	
	/**
	 * Função para bind do evento Change do Select de aprovador do sigajuri.
	 * Essa função faz com que os valores do Select atuem como filtros para a Datatable, que é recarregada a cada alteração de valor nos Selects.
	 * @param el Elemento Select que disparou o evento.
	 * @param ev Objeto do evento em si.
	 */
	aprovadorChange: function(el,ev){
		if ($('#sAprovadorSIGAJURI_'+this.instanceId).val() != "0"){
			$('#cdGrupoAprovador_'+this.instanceId).val('');
	  	    $('#sGrupoAprovador_'+this.instanceId).val('');
	 	    $('#cdPapelAprovador_'+this.instanceId).val('');
	 	    $('#sPapelAprovador_'+this.instanceId).val('');
	  	    $('#zoomPapelAprovador_'+this.instanceId).prop('disabled', true);
	 	    $('#zoomGrupoAprovador_'+this.instanceId).prop('disabled', true);
		}else{
	 	    $('#sAprovadorSIGAJURI_'+this.instanceId).val('0');
			$('#zoomPapelAprovador_'+this.instanceId).prop('disabled', false);
	 	    $('#zoomGrupoAprovador_'+this.instanceId).prop('disabled', false);
		}
	},
	
	/**
	 * Função para bind do evento Click dos botões de zoom utilizados.
	 * @param el Elemento do Botão que disparou o evento.
	 * @param ev Objeto do evento em si.
	 */
    mostraZoom: function(el,ev){
    	var tipo = el.id; // Recupera a id do botão que disparou o evento para determinar qual tipo de zoom deve ser executado.
    	var that = this; // Mantém uma referência do Widget para ser usada em callbacks.
    	var type = ""; 
    	var ds = "";
    	var zoomTitle = "";
    	var resultFields = "id,Desc";
    	var dataFields = "";
    	
    	// Determina titulo, campos e datasets a serem utilizados com base em qual zoom foi acionado.
    	switch(tipo){    	
    	case "zoomGrupoAprovador_"+this.instanceId:
    		type = "grupo";
    		ds = "dsGrupos";
    		zoomTitle = "${i18n.getTranslation('application.zoom.Grupo.Title')}";
    		dataFields = "Desc," + "${i18n.getTranslation('application.zoom.Grupo.Header')}";
    		break;
    	case "zoomPapelAprovador_"+this.instanceId:
    		type = "papel";
    		ds = "dsPapeis";
    		zoomTitle = "${i18n.getTranslation('application.zoom.Papel.Title')}";
    		dataFields = "Desc," + "${i18n.getTranslation('application.zoom.Papel.Header')}";
    		break;
    	case "zoomTipoFu_"+this.instanceId:
    		type = "tipofu";
    		ds = "dsTipoFU";
    		zoomTitle = "${i18n.getTranslation('application.zoom.TipoFU.Title')}";
    		resultFields = "id,TipoFU"
    		dataFields = "id,Codigo,TipoFU," + "${i18n.getTranslation('application.zoom.TipoFU.Header')}";;
    		break;
    	}
    	
    	// Abre a janela de zoom de acordo com as variaveis determinadas.
    	window.open("/webdesk/zoom.jsp?datasetId=" + ds + "&dataFields=" + dataFields + "&resultFields=" + resultFields + "&type=" + type + "&title=" + zoomTitle, "zoom", "status , scrollbars=no ,width=600, height=350 , top=0 , left=0");
    	
    	// Prepara uma variavel para receber a função que lida com o retorno do Zoom.
    	var newSelectedItem = function(selectedItem){
    		that.selectedZoomItem(selectedItem);
    	};
    	setSelectedZoomItem = newSelectedItem;
    },
    
    /**
     * Função para lidar com o retorno do zoom.
     * @param selectedItem Item selecionado no zoom.
     */
    selectedZoomItem: function(selectedItem){
    	// trata o retorno do Zoom de acordo com o seu tipo, preenchendo os campos da widget correspondentes.
    	switch(selectedItem.type){
    	case "grupo":
    		$('#cdGrupoAprovador_'+this.instanceId).val(selectedItem.id);
    		$('#sGrupoAprovador_'+this.instanceId).val(selectedItem.Desc);
    		break;
    	case "papel":
    		$('#cdPapelAprovador_'+this.instanceId).val(selectedItem.id);
    		$('#sPapelAprovador_'+this.instanceId).val(selectedItem.Desc);
    		break;
    	case "tipofu":
    		$('#cdTipoFollowUp_'+this.instanceId).val(selectedItem.id);
    		$('#sTipoFollowUp_'+this.instanceId).val(selectedItem.TipoFU);
    		break;    	
    	}
    },
    
    /**
     * Função para bind do evento Click dos botões de limpar campo com zoom.
     * @param el Elemento Botão que disparou o evento.
     * @param ev Objeto do evento em si.
     */
    clearZoom: function(el,ev){
    	var tipo = el.id; // Separa o id do botão.

    	// Limpa os campos de acordo com qual dos botões foi pressionado.
    	switch(tipo){    	
    	case "clearGrupoAprovador_"+this.instanceId:
    		$('#cdGrupoAprovador_'+this.instanceId).val('');
      	    $('#sGrupoAprovador_'+this.instanceId).val('');
    		break;
    	case "clearPapelAprovador_"+this.instanceId:
     	    $('#cdPapelAprovador_'+this.instanceId).val('');
     	    $('#sPapelAprovador_'+this.instanceId).val('');
    		break;
    	case "clearTipoFu_"+this.instanceId:
     	    $('#cdTipoFollowUp_'+this.instanceId).val('');
     	    $('#sTipoFollowUp_'+this.instanceId).val('');
    		break;
    	}
    },
    
    /**
     * Função para bind do evento de Click do botão de salvar configuração de follow-up.
     * Essa função salva os dados preenchidos na base da widget, criando um registro novo ou atualizando um já existente, de forma automática.
     * A lógica pesada de inserção e edição está no código do dataset dsSaveFollowUp, deixando o trabalho pesado para ser executado no servidor.
     */
    saveFollowUp: function(){
    	// Realiza a validação do formulário da widget e, se tudo estiver OK, monta o array de dados nas Constraints e chama o Dataset que executa o procedimento.
    	if (this.validateFields()){
	    	var fields = new Array();
	    	var constraints = new Array();
	    	var values = new Array();
	    	
	    	values['csFaixaInicial']=  $('#sFaixaValFrom_'+this.instanceId).val();
	    	values['csFaixaFinal'] 	=  $('#sFaixaValTo_'+this.instanceId).val();
	    	
	    	if (values['csFaixaInicial'] == ""){
	    		values['csFaixaInicial'] = '0';
	    	}
	    	
	    	if ((values['csFaixaInicial'] != "") && (values['csFaixaFinal'] == "")){
	    		FLUIGC.message.alert({
    			    message: data.values[0]['Status'],
    			    title: "${i18n.getTranslation('application.error.Title')}",
    			    label: "${i18n.getTranslation('application.button.Close')}"
    			}, function(el, ev) {
    			});
	    	}
	    	
	    	constraints.push(DatasetFactory.createConstraint('cdAssJur', $('#sAssuntoJuridico_'+this.instanceId).val(), $('#sAssuntoJuridico_'+this.instanceId).val(), ConstraintType.MUST));
	    	constraints.push(DatasetFactory.createConstraint('sAssJur', $('#sAssuntoJuridico_'+this.instanceId+' :selected').text(), $('#sAssuntoJuridico_'+this.instanceId+' :selected').text(), ConstraintType.MUST));
	    	constraints.push(DatasetFactory.createConstraint('cdTipoFU', $('#cdTipoFollowUp_'+this.instanceId).val(), $('#cdTipoFollowUp_'+this.instanceId).val(), ConstraintType.MUST));
	    	constraints.push(DatasetFactory.createConstraint('sTipoFU', $('#sTipoFollowUp_'+this.instanceId).val(), $('#sTipoFollowUp_'+this.instanceId).val(), ConstraintType.MUST));
	    	constraints.push(DatasetFactory.createConstraint('cdGrupo', $('#cdGrupoAprovador_'+this.instanceId).val(), $('#cdGrupoAprovador_'+this.instanceId).val(), ConstraintType.MUST));
	    	constraints.push(DatasetFactory.createConstraint('sGrupo', $('#sGrupoAprovador_'+this.instanceId).val(), $('#sGrupoAprovador_'+this.instanceId).val(), ConstraintType.MUST));
	    	constraints.push(DatasetFactory.createConstraint('cdPapel', $('#cdPapelAprovador_'+this.instanceId).val(), $('#cdPapelAprovador_'+this.instanceId).val(), ConstraintType.MUST));
	    	constraints.push(DatasetFactory.createConstraint('sPapel', $('#sPapelAprovador_'+this.instanceId).val(), $('#sPapelAprovador_'+this.instanceId).val(), ConstraintType.MUST));
	    	constraints.push(DatasetFactory.createConstraint('sPrioridade', $('#sPrioridade_'+this.instanceId).val(), $('#sPrioridade_'+this.instanceId).val(), ConstraintType.MUST));
	    	constraints.push(DatasetFactory.createConstraint('cdAprovadorSIGAJURI', $('#sAprovadorSIGAJURI_'+this.instanceId).val(), $('#sAprovadorSIGAJURI_'+this.instanceId).val(), ConstraintType.MUST));
	    	constraints.push(DatasetFactory.createConstraint('sAprovadorSIGAJURI', $('#sAprovadorSIGAJURI_'+this.instanceId+' :selected').text(), $('#sAprovadorSIGAJURI_'+this.instanceId+' :selected').text(), ConstraintType.MUST));


            constraints.push(DatasetFactory.createConstraint('sFaixaInicial', values['csFaixaInicial'], values['csFaixaInicial'], ConstraintType.MUST));
            constraints.push(DatasetFactory.createConstraint('sFaixaFinal'  , values['csFaixaFinal']  , values['csFaixaFinal']  , ConstraintType.MUST));
	    	
	    	this.loadDatasetValues('dsSaveFollowUp', fields, constraints, null);
    	}
    },
    
    /**
     * Função para bind do evento de Click do botão de limpar campos da widget.
     * Essa função limpa todos os campos e recarrega a Datatable, limpando assim sua seleção e garantindo os dados mais recentes.
     */
    clearFollowUp: function(){
    	// Limpa o valor de todos os campos.
	    $('#sAssuntoJuridico_'+this.instanceId).val('');
	    $('#cdTipoFollowUp_'+this.instanceId).val('');
	    $('#sTipoFollowUp_'+this.instanceId).val('');
	    $('#cdGrupoAprovador_'+this.instanceId).val('');
	    $('#sGrupoAprovador_'+this.instanceId).val('');
	    $('#cdPapelAprovador_'+this.instanceId).val('');
	    $('#sPapelAprovador_'+this.instanceId).val('');
	    $('#sPrioridade_'+this.instanceId).val('');
	    $('#sFaixaValFrom_'+this.instanceId).val('');
	    $('#sFaixaValTo_'+this.instanceId).val('');
	    $('#sAprovadorSIGAJURI_'+this.instanceId).val('0');
	    
	    // Recarrega a Datatable.
	    this.updateDatatable();
    },
    
    /**
     * Função para bind do evento de Click do botão de deletar configuração de Follow-Up selecionada.
     * Essa função apaga uma configuração que tenha sido delecionada na Datatable.
     */
    deleteFollowUp: function(){
    	// Recupera a linha selecionada.
    	var selectedRow = this.configFollowUp.getRow(this.configFollowUp.selectedRows()[0]);
    	
    	// Caso haja uma linha selecionada, realiza a chamada ao dataset dsDeleteFollowUp que faz a exclusão da linha pelo seu cardId.
    	if (selectedRow != null){
    		var fields = new Array();
        	var constraints = new Array();
        	constraints.push(DatasetFactory.createConstraint('cdCardId', selectedRow['metadata#id'], selectedRow['metadata#id'], ConstraintType.MUST));
        	
        	this.loadDatasetValues('dsDeleteFollowUp', fields, constraints, null);    		
    	}
    },
    
    deleteFollowUpById: function(id){
		var fields = new Array();
    	var constraints = new Array();
    	constraints.push(DatasetFactory.createConstraint('cdCardId', id, id, ConstraintType.MUST));
    	
    	this.loadDatasetValues('dsDeleteFollowUp', fields, constraints, null);
    },
    
    /**
     * Recarrega a Datatable com os valores passados como parametro. 
     * É o ponto final do recarregamento da Datatable. 
     * Para a parte inicial, ver updateDatatable.
     * @param data Valores retornados pela chamada ao Dataset.
     */
    loadDatatable: function(data){
    	var _this = this; // Guarda uma referencia ao objeto Widget para uso em funções de callback.
    	
    	// Constroi a Datatable com os dados passados, provindos do Dataset.
    	this.configFollowUp = FLUIGC.datatable('#dtFollowUp_'+this.instanceId, {
    		dataRequest: data,
    		renderContent: '.template_datatable',
    	    //renderContent: ['metadata#id', 'cdAssJur', 'sAssJur', 'cdTipoFU', 'sTipoFU','cdAprovadorSIGAJURI', 'sAprovadorSIGAJURI', 'cdGrupo', 'sGrupo', 'cdPapel', 'sPapel', 'sPrioridade', 'sFaixaInicial', 'sFaixaFinal'],
    	    header: [
    	        {
    	        	'title': "${i18n.getTranslation('application.datatable.column.Id')}",
    	        	'display': false
    	        },
    	        {
    	        	'title': "${i18n.getTranslation('application.datatable.column.cdAssJur')}",
    	        	'display': false
    	        },
    	        {
    	        	'title': "${i18n.getTranslation('application.datatable.column.sAssJur')}",
    	        	'standard': true
    	        },
    	        {
    	        	'title': "${i18n.getTranslation('application.datatable.column.cdTipoFU')}",
    	        	'display': false
    	        },
    	        {'title': "${i18n.getTranslation('application.datatable.column.sTipoFU')}"},
    	        {
    	        	'title': "${i18n.getTranslation('application.datatable.column.cdAprovadorSIGAJURI')}",
    	        	'display': false
    	        },
    	        {
    	        	'title': "${i18n.getTranslation('application.datatable.column.sAprovadorSIGAJURI')}",
    	        	'standard': true
    	        },
    	        {
    	        	'title': "${i18n.getTranslation('application.datatable.column.cdGrupo')}",
    	        	'display': false
    	        },
    	        {'title': "${i18n.getTranslation('application.datatable.column.sGrupo')}"},
    	        {
    	        	'title': "${i18n.getTranslation('application.datatable.column.cdPapel')}",
    	        	'display': false
    	        },
    	        {'title': "${i18n.getTranslation('application.datatable.column.sPapel')}"},
    	        {'title': "${i18n.getTranslation('application.datatable.column.sPrioridade')}"},
    	        {'title': "${i18n.getTranslation('application.datatable.column.sFaixaInicial')}"},
    	        {'title': "${i18n.getTranslation('application.datatable.column.sFaixaFinal')}"},
    	        {'title': "${i18n.getTranslation('application.datatable.column.btnDelete')}",
    	        	'size': 'col-md-1 center-align'}
    	    ],
    	    multiSelect: false,
    	    classSelected: 'info',
    	    search: {
	   	        enabled: false
	   	    },
	   	    navButtons: {
	   	        enabled: false
	   	    },
	   	    actions: {
	   	        enabled: false
	   	    },
	   	    tableStyle: 'table-striped'
    	}, function (err, data){ // Função executada após o preenchimento da Datatable, realiza o binding dos eventos da datatable.
    		if (!_this.isDatatableBound){ 
    			_this.datatableBinding();
    		}
    	});
    },
    
    /**
     * Realiza o binding dos eventos da Datatable.
     */
    datatableBinding: function(){
    	var _this = this;// Guarda uma referencia ao objeto Widget para uso em funções de callback.
    	
    	// Bind do evento onSelectRow da Datatable, disparado ao selecionar uma linha. Popula os campos do formulario com os valores da linha.
    	$('#dtFollowUp_'+this.instanceId).on('fluig.datatable.onselectrow', function(){
    	    var selectedRow = _this.configFollowUp.getRow(_this.configFollowUp.selectedRows()[0]);
    	    $('#sAssuntoJuridico_'+_this.instanceId).val(selectedRow.cdAssJur);
    	    $('#sTipoFollowUp_'+_this.instanceId).val(selectedRow.sTipoFU);
    	    $('#cdTipoFollowUp_'+_this.instanceId).val(selectedRow.cdTipoFU);
    	    $('#sAprovadorSIGAJURI_'+_this.instanceId).val(selectedRow.cdAprovadorSIGAJURI);
    	    $('#cdGrupoAprovador_'+_this.instanceId).val(selectedRow.cdGrupo);
    	    $('#sGrupoAprovador_'+_this.instanceId).val(selectedRow.sGrupo);
    	    $('#cdPapelAprovador_'+_this.instanceId).val(selectedRow.cdPapel);
    	    $('#sPapelAprovador_'+_this.instanceId).val(selectedRow.sPapel);
    	    $('#sPrioridade_'+_this.instanceId).val(selectedRow.sPrioridade);
    	    $('#sFaixaValFrom_'+_this.instanceId).val(selectedRow.sFaixaInicial);
    	    $('#sFaixaValTo_'+_this.instanceId).val(selectedRow.sFaixaFinal);
    	});
    	
    	$('#dtFollowUp_'+this.instanceId).on('click', '[data-delete-row]', function(ev){
    		var id = ev.currentTarget.id.split('_')[1];
    		FLUIGC.message.confirm({
    		    message: "${i18n.getTranslation('application.datatable.column.btnDelete.comfirmText')}",
    		    title: "${i18n.getTranslation('application.datatable.column.btnDelete.comfirmTitle')}",
    		    labelYes: "${i18n.getTranslation('application.datatable.column.btnDelete.comfirmYes')}",
    		    labelNo: "${i18n.getTranslation('application.datatable.column.btnDelete.comfirmNo')}"
    		}, function(result, el, ev) {
    		    if (result){
    		    	_this.deleteFollowUpById(id);
    		    } else {
    		    	_this.clearFollowUp();
    		    }
    		});
    	});
    	
    	this.isDatatableBound = true;
    },
    
    /**
     * Prepara os dados para a chamada AJAX que vai popular a Datatable. 
     * É o ponto de inicio do recarregamento da Datatable.
     * Para a parte final, ver loadDatatable
     */
    updateDatatable: function(){
    	// Recupera os valores dos selects para que eles atuem como filtros.
    	var selectAssJur = $('#sAssuntoJuridico_'+this.instanceId).val();
    	var selectTipoFU = $('#cdTipoFollowUp_'+this.instanceId).val();
    	
    	// Prepara variaveis de Campos, Filtros e Ordenação para chamar o Dataset.
    	var fields = new Array('metadata#id', 'cdAssJur', 'sAssJur', 'cdTipoFU', 'sTipoFU', 'cdAprovadorSIGAJURI', 'sAprovadorSIGAJURI', 'cdGrupo', 'sGrupo', 'cdPapel', 'sPapel', 'sPrioridade', 'sFaixaInicial', 'sFaixaFinal');
    	var constraints = new Array();
    	var sort = new Array();
    	
    	// garante a seleção contenha apenas configurações ativas, descartando as versões antigas de registros que foram editados.
    	constraints.push(DatasetFactory.createConstraint('metadata#active', true, true, ConstraintType.MUST));

    	// Esses dois IFs trabalham para garantir que os Selects atuem como filtros para a Datatable.
    	if (selectAssJur != ''){
    		constraints.push(DatasetFactory.createConstraint('cdAssJur', selectAssJur, selectAssJur, ConstraintType.MUST));
    	}
    	
    	if (selectTipoFU != ''){
    		constraints.push(DatasetFactory.createConstraint('cdTipoFU', selectTipoFU, selectTipoFU, ConstraintType.MUST));
    	}
    	
    	// Campos de ordenação.
    	sort.push('cdAssJur');
    	sort.push('cdTipoFU');
    	sort.push('cdGrupo');
    	sort.push('cdPapel');
    	
    	// Dispara a chamada ao Dataset via AJAX.
    	this.loadDatasetValues('wcmSIGAJURI_FollowUp', fields , constraints, sort);
    },
    
    /**
     * Valida os valores dos campos da Widget.
     * @return {Boolean} TRUE caso os campos estejam válidos, FALSE caso haja algum erro de preenchimento.
     */
    validateFields: function(){
    	// Recupera os valores do formulario da widget.
    	var cdAssJur = $('#sAssuntoJuridico_'+this.instanceId).val();
	    var cdTipoFU = $('#cdTipoFollowUp_'+this.instanceId).val();
	    var sTipoFU = $('#sTipoFollowUp_'+this.instanceId).val();
	    var cdGrupo = $('#cdGrupoAprovador_'+this.instanceId).val();
	    var cdPapel = $('#cdPapelAprovador_'+this.instanceId).val();
	    var sPrioridade = $('#sPrioridade_'+this.instanceId).val();
	    var sFaixaFrom = $('#sFaixaValFrom_'+this.instanceId).val();
	    var sFaixaTo = $('#sFaixaValTo_'+this.instanceId).val();
	    var cdAprovadorSIGAJURI = $('#sAprovadorSIGAJURI_'+this.instanceId).val();
	    
	    // Começa a montagem da mensagem de validação.
	    var msg = "<h3>${i18n.getTranslation('application.error.Validation')}</h3><ul>";
	    var success = true;
	    
	    if (cdAssJur == ''){ // Valida se o campo Assunto Juridico foi preenchido.
	    	msg += "<li>${i18n.getTranslation('application.label.AssJur')}</li>";
	    	success = false;
	    }
	    if (cdTipoFU == ''){ // Valida se o campo Tipo de Follow-Up foi preenchido.
	    	msg += "<li>${i18n.getTranslation('application.label.TipoFU')}</li>";
	    	success = false;
	    }
	    if ((cdGrupo == '') && (cdAprovadorSIGAJURI == '0')){ // Valida se o campo Grupo foi preenchido.
	    	msg += "<li>${i18n.getTranslation('application.label.GrupoAprova')}</li>";
	    	success = false;
	    }
	    if (sPrioridade == ''){ // Valida se o campo Prioridade foi preenchido.
	    	msg += "<li>${i18n.getTranslation('application.label.Prioridade')}</li>";
	    	success = false;
	    }
	    
	    //Valida se algum dos valores não estiver em branco, ambos não podem estar em branco
	    if (sFaixaFrom != '' && sFaixaTo == ''){
	    	msg += "<li>${i18n.getTranslation('application.error.Validation.Values.Fim.Empty')}</li>"
    		success = false;
	    }
	    
	    //Valida se ambos os campos de Faixa de valor foram preenchidos e, em caso positivo, se os valores estão na ordem correta, ou seja, o limite minimo é menor que o limite maximo.
	    if (sFaixaFrom != '' && sFaixaTo != '' && parseFloat(sFaixaFrom.replace(/\./g,'').replace(/,/g,'.')) > parseFloat(sFaixaTo.replace(/\./g,'').replace(/,/g,'.'))){
	    	msg += "<li>${i18n.getTranslation('application.label.FaixaVal')}</li>";
	    	success = false;
	    }
	    
	    msg += "</ul>";
	    
	    // Caso o formulário não passe na validação, exibe a mensagem para o usuário, indicando os problemas,
	    if (!success){
		    FLUIGC.message.alert({
			    message: msg,
			    title: "${i18n.getTranslation('application.error.Title.Validate')}",
			    label: "${i18n.getTranslation('application.button.Close')}"
			}, function(el, ev) {
			});
	    }
	    
	    // retorna o resultado da validação.
	    return success;
    },
    clearSaveFollowUp: function(){
    	// Limpa o valor de todos os campos.
	    $('#sPrioridade_'+this.instanceId).val('');
	    $('#sFaixaValFrom_'+this.instanceId).val('');
	    $('#sFaixaValTo_'+this.instanceId).val('');
	    $('#sAprovadorSIGAJURI_'+this.instanceId).val('0');
	    
	    // Recarrega a Datatable.
	    this.updateDatatable();
    }
});