function createDataset(fields, constraints, sortFields) {
	// Dataset de parametros da Widget. Expandir conforme necessidade, mantendo os parametros o mais centralizados possivel.~
	
	var dsParamsSIGAJURI = DatasetBuilder.newDataset();
	
	// Usuario Admin para a widget.
	dsParamsSIGAJURI.addColumn("sAdmin");
	// Senha do usuario Admin para a widget.
	dsParamsSIGAJURI.addColumn("sPassword");
	// Id do Form da Widget, usado para salvar as informações de aprovadores de follow-up
	dsParamsSIGAJURI.addColumn("nFormIdAprov");
	// Id da Empresa no Fluig.
	dsParamsSIGAJURI.addColumn("nTenantId");
	// Id do Form da Widget, usado para salvar as informações de distribuição de contratos
	dsParamsSIGAJURI.addColumn("nFormIdContrato");
	// Id do Form da Widget, usado para salvar as informações de distribuição de contratos
	dsParamsSIGAJURI.addColumn("nFormIdConsultivo");
	// Usuário para autenticação básica ( Protheus ) 
	dsParamsSIGAJURI.addColumn("sUserAuth");
	// Senha do usuário para autenticação básica ( Protheus ) 
	dsParamsSIGAJURI.addColumn("sPassAuth");
	
	// user, senha, id da widget e o código da empresa.
	dsParamsSIGAJURI.addRow(new Array("admin", "cagece@2025", 26, 1, 25, 24, "totvs_guilherme.silva", "innova@01"));
	
	
	return dsParamsSIGAJURI;
}