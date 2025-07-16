function destinatariosHTML() {
    const CONTATOS = renderContatosAgenda()
    const GRUPOS = renderGrupos()
    const PAPEL_ASSINANTE = PAPEIS.join("")

    return `
        <ul class="nav nav-tabs nav-ellipsis" role="tablist">
            <li class="active"><a data-toggle="tab" href="#novo-destinatario"><i class="far fa-user"></i> Novo destinatário</a></li>
            <li><a data-toggle="tab" href="#contato-agenda"><i class="far fa-address-card"></i> Contato da agenda</a></li>
            <li><a data-toggle="tab" href="#grupo-agenda"><i class="fas fa-users"></i> Grupo da agenda</a></li>
        </ul>

        <section class="tab-content">
            <div class="tab-pane active" id="novo-destinatario">
                <div class="row">
                    <div class="form-group col-md-12">
                        <label class="required">Email</label>
                        <input type="search" name="email" id="email" data-field-id="emailCtt" dir="ltr" spellcheck=false autocorrect="off" autocomplete="off" autocapitalize="off" maxlength="2048" tabindex="1">
                    </div>

                    <div class="form-group col-md-12">
                        <label class="required">Ação</label>
                        <select name="acao" id="acao" class="form-control" data-field-id="tipoAss">
                            <option value="">Selecione...</option>
                            <option value="0">Assinar</option>
                            <option value="1">Validar</option>
                            <option value="2">Testemunhar</option>
                            <option value="3">Observar</option>
                            <option value="4">Assinar com Certificado (A1 / A3)</option>
                        </select>
                    </div>

                    <input type="hidden" name="ordemAssinatura" id="ordemAssinatura" data-field-id="ordemAss">

                    <div class="form-group col-md-12">
                        <label>Papel na assinatura</label>
                        <select name="papelAssinante" id="papelAssinante" class="form-control">
                            <option value="">Selecione...</option>
                            ${PAPEL_ASSINANTE}
                        </select>
                    </div>

                    <div class="form-group col-md-12">
                        <label class="required">Tipo de Autenticação</label>
                        <select name="tipoAuth" id="tipoAuth" class="form-control">
                            <option value="">Selecione...</option>
                            <option value="1">Login no Sistema (TAE)</option>
                            <option value="2">Envio de Código por E-mail</option>
                        </select>
                    </div>
                </div>

                <section class="codigo-email" style="display:none;">
                    <h4 class="modal-title"><i class="far fa-envelope"></i> Dados para Autenticação via Envio de Código por E-mail</h4>

                    <div class="row space">
                        <div class="form-group col-md-12">
                            <label class="required">Nome completo</label>
                            <div class="input-group">
                                <input type="text" name="nomeCompleto" id="nomeCompleto" class="form-control">
                                <span class="input-group-addon">
                                    <i class="far fa-user"></i>
                                </span>
                            </div>
                        </div>

                        <div class="form-group col-md-12">
                            <label class="required">Tipo de Identificação</label>
                            <select name="tipoIdentificacao" id="tipoIdentificacao" class="form-control">
                                <option value="">Selecione...</option>
                                <option value="1">Brasil (CPF ou CNPJ)</option>
                                <option value="2">Id Internacional</option>
                                <option value="3">Não Possui (Não Solicitar)</option>
                            </select>
                        </div>

                        <div class="form-group col-md-12" style="display:none;">
                            <label class="required">Documento de Identificação</label>
                            <div class="input-group">
                                <input type="text" name="documentoIdentificacao" id="documentoIdentificacao" class="form-control cpfOuCnpj">
                                <span class="input-group-addon">
                                    <i class="fas fa-id-card"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div class="tab-pane fade" id="contato-agenda">
                <table id="lista-contatos" class="table pai-filho table-striped">
                    <thead>
                        <tr>
                            <th></th>
                            <th><i class="fas fa-signature"></i> Nome completo</th>
                            <th><i class="far fa-envelope"></i> E-mail</th>
                            <th><i class="fas fa-users"></i> Grupo</th>
                            <th><i class="fas fa-wrench"></i> Ação padrão</th>
                            <th><i class="fas fa-file-signature"></i> Papel na assinatura</th>
                        </tr>
                    </thead>

                    <tbody>${CONTATOS ? CONTATOS : ""}</tbody>
                </table>
            </div>

            <div class="tab-pane fade" id="grupo-agenda">
                <table id="lista-grupos" class="table pai-filho table-striped">
                    <thead>
                        <tr>
                            <th></th>
                            <th><i class="fas fa-users"></i> Nome do grupo</th>
                            <th><i class="far fa-user-circle"></i> N° de participantes</th>
                        </tr>
                    </thead>

                    <tbody>${GRUPOS ? GRUPOS : ""}</tbody>
                </table>
            </div>
        </section>
    `
}

function loginHTML() {
    return `
        <section id="login">
            <header>
                <section id="logo">
                    <img src="./totvs-logo.png" alt="TOTVS" title="LOGO TOTVS" width="140">
                    <h3 class="panel-title main-title">Login</h3>
                </section>
            </header>

            <main>
                <div class="row">
                    <div class="form-group col-md-12">
                        <label class="required">E-mail</label>
                        <div class="input-group">
                            <input type="text" name="email" id="email" class="form-control" autocomplete="off">
                            <span class="input-group-addon">
                                <i class="far fa-envelope"></i>
                            </span>
                        </div>
                    </div>

                    <div class="form-group col-md-12">
                        <label class="required">Senha</label>
                        <div class="input-group">
                            <input type="password" name="senha" id="senha" class="form-control" autocomplete="off">
                            <span class="input-group-addon">
                                <i class="far fa-eye"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    `
}

function getGrupo(CODIGO_GRUPO) {
    if(GRUPOS && GRUPOS.length) {
		const [GRUPO] = GRUPOS.filter(GRUPO => GRUPO.id == CODIGO_GRUPO)
		return GRUPO ? GRUPO.nome : "Nenhum"
	}
	else return "Nenhum"
}

function getAcao(CODIGO_ACAO) {
    switch(CODIGO_ACAO) {
        case 0:
            return "Assinar"
        
        case 1:
            return "Validar"
            
        case 2:
            return "Testemunhar"
            
        case 3:
            return "Observar"
            
        case 4:
            return "Assinar com Certificado (A1 / A3)"     
    }
}

function renderContatosAgenda() {
    if(CONTATOS_AGENDA && CONTATOS_AGENDA.length) {
        const HTML = CONTATOS_AGENDA.map(CONTATO => {
            const {id, nomeCompleto, email, idGrupo, acao, papelAssinante} = CONTATO

            return `
                <tr data-id="${id}">
                    <td class="align-center">
                        <input type="checkbox" name="selecionar" id="selecionar" class="checkbox">
                    </td>
                    <td>${nomeCompleto}</td>
                    <td>${email}</td>
                    <td>${getGrupo(idGrupo)}</td>
                    <td>${getAcao(acao)}</td>
                    <td>${papelAssinante}</td>
                </tr>
            `
        })

        return HTML.join("")
    }
}

function renderGrupos() {
    if(GRUPOS && GRUPOS.length) {
        const HTML = GRUPOS.map(GRUPO => {
            const {id, nome, quantidadeContatos} = GRUPO 

            return `
                <tr data-id="${id}">
                    <td class="align-center">
                        <input type="checkbox" name="selecionarGrupo" id="selecionarGrupo" class="checkbox">
                    </td>
                    <td>${nome}</td>
                    <td>${quantidadeContatos}</td>
                </tr>
            `
        })

        return HTML.join("")
    }
}

function getMembrosGrupo() {
    const SELECTOR = $(`#lista-grupos tbody tr [type="checkbox"]:checked`)
    const GRUPOS_ID = Array.from(SELECTOR).map(EL => Number($(EL).closest("tr").attr("data-id")))
    const MEMBROS = CONTATOS_AGENDA.filter(CONTATO => GRUPOS_ID.includes(CONTATO.idGrupo))

    return MEMBROS
}

function getContatosSelecionados() {
    const SELECTOR = $(`#lista-contatos tbody tr [type="checkbox"]:checked`)
    const SELECIONADOS_ID = Array.from(SELECTOR).map(EL => Number($(EL).closest("tr").attr("data-id")))
    const SELECIONADOS_INFO = CONTATOS_AGENDA.filter(CONTATO => SELECIONADOS_ID.includes(CONTATO.id))

    return SELECIONADOS_INFO
}