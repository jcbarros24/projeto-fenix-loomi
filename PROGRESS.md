# Relatório de Progresso — Projeto Fenix Loomi (Desafio Nortus)

> **Contexto importante (rastreabilidade):** eu só percebi a exigência de um board de gestão (GitHub Projects) **após concluir a maior parte do desenvolvimento**. Por isso, **alguns PRs/commits não estão automaticamente vinculados às issues**, pois eles foram criados antes da estruturação do board.  
> Para não “maquiar” histórico nem reescrever commits, eu usei o GitHub Projects/Issues como **checklist consolidado** das entregas e como forma de documentar **priorização, organização e dificuldades**. O histórico do repositório (commits/branches) permanece como a fonte fiel da evolução do código.

---

## 🔗 Links Importantes

<div align="center">

<a href="https://github.com/jcbarros24/projeto-fenix-loomi" target="_blank">
  <img src="https://img.shields.io/badge/Reposit%C3%B3rio-GitHub-black?logo=github&style=for-the-badge" alt="Repositório GitHub"/>
</a>
&ensp;
<a href="https://fenix-loomi.vercel.app" target="_blank">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&style=for-the-badge" alt="Deploy Vercel"/>
</a>
&ensp;
<a href="https://github.com/users/jcbarros24/projects/2" target="_blank">
  <img src="https://img.shields.io/badge/Board-Projects-blue?logo=github&style=for-the-badge" alt="GitHub Projects"/>
</a>
&ensp;
<a href="https://nortus-challenge.api.stage.loomi.com.br/docs" target="_blank">
  <img src="https://img.shields.io/badge/Swagger%20API-base-green?logo=swagger&style=for-the-badge" alt="Swagger API"/>
</a>

</div>

<br />

- **Repositório:** [jcbarros24/projeto-fenix-loomi](https://github.com/jcbarros24/projeto-fenix-loomi)
- **Deploy:** [fenix-loomi.vercel.app](https://fenix-loomi.vercel.app)
- **Board:** [GitHub Projects](https://github.com/users/jcbarros24/projects/2)
- **Swagger / API base:**  
  `NEXT_PUBLIC_API_URL="https://nortus-challenge.api.stage.loomi.com.br"`


---
## 1) Plataforma de gestão de atividades (backlog)
Utilizei um **Kanban no GitHub Projects** para consolidar o backlog e registrar as entregas do desafio. As tarefas foram registradas como **Issues** e adicionadas ao board com as colunas:
- **Backlog** → itens pendentes
- **In Progress** → itens em andamento (mantive poucos para foco)
- **Done** → itens concluídos

> Observação: devido ao timing de criação do board (após boa parte do desenvolvimento), algumas issues não possuem PR “Closes #x” associado. Onde fez sentido, adicionei referências no corpo das issues.

---

## 2) Como organizei as atividades
- Separei o trabalho por histórias do desafio (Login, Dashboard, Tickets, Chat, Simulador).
- Quebrei em tasks (issues) e acompanhei num Kanban (Backlog → In Progress → Done).
- Mantive poucas tarefas em andamento para evitar dispersão.

---

## 3) Como priorizei
1) Base do projeto (limpeza, padrões, auth e api client)  
2) Funcionalidades obrigatórias (dashboard, tickets, chat, simulador)  
3) UX/Polish (loading/empty/error, toasts, a11y, responsividade extra)

---

## 4) Dificuldades e como lidei
- **API legacy / percepção de lentidão:** cache + skeletons + feedback (toasts).
- **Auth (cookie + localStorage) + rotas protegidas:** middleware + hydrator + handler 401.
- **Chat com IA:** apenas consumo do Swagger (sem IA real) + UI de sugestões e insights.
- **Rastreabilidade do processo:** board estruturado ao final como checklist, sem reescrever histórico do repositório.

---

## 5) O que faria com mais tempo
- Testes (unit + e2e), observabilidade e performance para listas grandes.
- Completar ações rápidas do chat com endpoints reais e persistência de eventos.

---

## 6) Referências
- Detalhes técnicos: `README.md`