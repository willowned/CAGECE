<div id="wcmFollowup_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide"
     data-params="wcmFollowup.instance()">
	<h2>${i18n.getTranslation('application.label.title')}</h2>
	<hr />
	<form class="form-horizontal" role="form">
		<input type="hidden" id="hiddenLoading_${instanceId}"></input>
		<div class="form-group">
			<label for="sAssuntoJuridico_${instanceId}" class="col-md-2 control-label">${i18n.getTranslation('application.label.AssJur')}*</label>
			<div class="col-md-10">
				<select class="form-control" id="sAssuntoJuridico_${instanceId}" data-select-change data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.AssJur')}">
					<option value="">${i18n.getTranslation('application.placeholder.AssuntosJuridicos')}</option>
				</select>
			</div>
		</div>
		<div class="form-group">		
			<input type="hidden" id="cdTipoFollowUp_${instanceId}"></input>
			<label for="sTipoFollowUp_${instanceId}" class="col-md-2 control-label">${i18n.getTranslation('application.label.TipoFU')}*</label>
			<div class="col-md-10 ">
				<div class="input-group">
					<input type="text" class="form-control" id="sTipoFollowUp_${instanceId}" placeholder="${i18n.getTranslation('application.placeholder.TiposFollowUp')}" readonly data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.TipoFU.text')}"></input>
					<span class="input-group-addon fs-cursor-pointer" id="zoomTipoFu_${instanceId}" data-open-zoom-grupo>
						<span class="fluigicon fluigicon-search zoomCustomer" data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.TipoFU.searcg')}"></span>
					</span>
					<span class="input-group-addon fs-cursor-pointer" id="clearTipoFu_${instanceId}" data-clear-zoom-grupo>
						<span class="fluigicon fluigicon-trash zoomCustomer" data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.TipoFU.trash')}"></span>
					</span>
				</div>
			</div>
		</div>
		<div class="form-group">
			<label for="sAprovadorSIGAJURI_${instanceId}" class="col-md-2 control-label">${i18n.getTranslation('application.label.AprovadorSIGAJURI')}*</label>
			<div class="col-md-10">
				<select class="form-control" id="sAprovadorSIGAJURI_${instanceId}" data-aprovador-change title="${i18n.getTranslation('application.tooltip.AprovadorSIGAJURI')}">
					<option value="0">-</option>
					<option value="NSZ_CPART1">Participante 1</option>
					<option value="NSZ_CPART2">Participante 2</option>
					<option value="NSZ_CPART3">Participante 3</option>
				</select>
			</div>
		</div>
		<div class="form-group">
			<input type="hidden" id="cdGrupoAprovador_${instanceId}"></input>
			<label for="sGrupoAprovador_${instanceId}" class="col-md-2 control-label">${i18n.getTranslation('application.label.GrupoAprova')}*</label>
			<div class="col-md-10 ">
				<div class="input-group">
					<input type="text" class="form-control" id="sGrupoAprovador_${instanceId}" placeholder="${i18n.getTranslation('application.placeholder.GrupoAprova')}" readonly data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.Grupo.text')}"></input>
					<span class="input-group-addon fs-cursor-pointer" id="zoomGrupoAprovador_${instanceId}" data-open-zoom-grupo>
						<span class="fluigicon fluigicon-search zoomCustomer" data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.Grupo.search')}"></span>
					</span>
					<span class="input-group-addon fs-cursor-pointer" id="clearGrupoAprovador_${instanceId}" data-clear-zoom-grupo>
						<span class="fluigicon fluigicon-trash zoomCustomer" data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.Grupo.trash')}"></span>
					</span>
				</div>
			</div>
		</div>
		<div class="form-group">
			<input type="hidden" id="cdPapelAprovador_${instanceId}"></input>
			<label for="sPapelAprovador_${instanceId}" class="col-md-2 control-label">${i18n.getTranslation('application.label.PapelAprova')}</label>
			<div class="col-md-10 ">
				<div class="input-group">
					<input type="text" class="form-control" id="sPapelAprovador_${instanceId}" placeholder="${i18n.getTranslation('application.placeholder.PapelAprova')}" readonly data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.Papel.text')}"></input>
					<span class="input-group-addon fs-cursor-pointer" id="zoomPapelAprovador_${instanceId}" data-open-zoom-papel>
						<span class="fluigicon fluigicon-search zoomCustomer" data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.Papel.search')}"></span>
					</span>
					<span class="input-group-addon fs-cursor-pointer" id="clearPapelAprovador_${instanceId}" data-clear-zoom-papel>
						<span class="fluigicon fluigicon-trash zoomCustomer" data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.Papel.trash')}"></span>
					</span>
				</div>
			</div>
		</div>
		<div class="form-group">
			<label for="sPrioridade_${instanceId}" class="col-md-2 control-label">${i18n.getTranslation('application.label.Prioridade')}*</label>
			<div class="col-md-3">
				<input type="text" class="form-control" id="sPrioridade_${instanceId}" placeholder="${i18n.getTranslation('application.placeholder.Prioridade')}" data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.Prioridade')}"></input>
			</div>
			<label for="sFaixaVal_${instanceId}" class="col-md-2 control-label">${i18n.getTranslation('application.label.FaixaVal')}</label>
			<div id="sFaixaVal_${instanceId}" class="col-md-5">
				<label for="sFaixaValFrom_${instanceId}" class="control-label sr-only">${i18n.getTranslation('application.label.FaixaValFrom')}</label>
				<div class="col-sm-5 nopadding-sides">
					<div class="input-group" data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.FaixaFrom')}">
						<span class="input-group-addon">${i18n.getTranslation('application.label.Currency')}</span>
						<input type="text" class="form-control right-align" id="sFaixaValFrom_${instanceId}" placeholder="${i18n.getTranslation('application.placeholder.FaixaValFrom')}" mask="#00.000.000.000.000,00"></input>
					</div>
				</div>
				<label for="sFaixaValTo_${instanceId}" class="col-sm-2 control-label center-align">${i18n.getTranslation('application.label.FaixaValTo')}</label>
				<div class="col-sm-5 nopadding-sides">
					<div class="input-group" data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.FaixaTo')}">
						<span class="input-group-addon">${i18n.getTranslation('application.label.Currency')}</span>
						<input type="text" class="form-control right-align" id="sFaixaValTo_${instanceId}" placeholder="${i18n.getTranslation('application.placeholder.FaixaValTo')}" mask="#00.000.000.000.000,00"></input>
					</div>
				</div>
			</div>
		</div>
		<div class="form-group">
	        <div class="col-sm-offset-2 col-sm-10">
            	<button class="btn btn-default" data-save-button data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.Save')}">${i18n.getTranslation('application.button.Save')}</button>
            	<button class="btn btn-default" data-clear-button data-toggle="tooltip" data-placement="top" title="${i18n.getTranslation('application.tooltip.Clear')}">${i18n.getTranslation('application.button.Clear')}</button>
        	</div>
		</div>
		<script type="text/template" class="template_datatable">
		    <tr>
		    	<td>{{metadata#id}}</td>
		    	<td>{{cdAssJur}}</td>
		    	<td>{{sAssJur}}</td>
		    	<td>{{cdTipoFU}}</td>
		    	<td>{{sTipoFU}}</td>
		    	<td>{{cdAprovadorSIGAJURI}}</td>
		    	<td>{{sAprovadorSIGAJURI}}</td>
		    	<td>{{cdGrupo}}</td>
		    	<td>{{sGrupo}}</td>
		    	<td>{{cdPapel}}</td>
		    	<td>{{sPapel}}</td>
		    	<td>{{sPrioridade}}</td>
		    	<td>{{sFaixaInicial}}</td>
		    	<td>{{sFaixaFinal}}</td>
		        <td class="center-align">
		        	<span class="btn btn-xs" id="deleteRow_{{metadata#id}}" data-delete-row data-toggle="tooltip" data-placement="left" title="${i18n.getTranslation('application.tooltip.Delete')}">
						<span class="fluigicon fluigicon-trash zoomCustomer"></span>
					</span>
				</td>
		    </tr>
		</script>
		<div class="form-group">
			<div class="col-sm-12" id="dtFollowUp_${instanceId}"></div>
		</div>
	</form>
</div>
<script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
<script type="text/javascript" src="/SIGAJURI_FollowUp/resources/js/mascaras.js"></script>