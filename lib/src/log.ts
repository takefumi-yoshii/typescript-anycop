import { SourcesAnyDiagnostics } from './getAllAnyDiagnostics'
export function log(diagnostics: SourcesAnyDiagnostics) {
  const {
    totalVarDeclCount,
    totalAnyDeclCount,
    errorMessage,
    coverage
  } = diagnostics
  console.log('--------------------')
  console.log(`totalVarDeclCount: ${totalVarDeclCount}`)
  console.log(`totalAnyDeclCount: ${totalAnyDeclCount}`)
  console.log(`coverage: ${coverage}`)
  console.log('--------------------')
  console.log(errorMessage)
  console.log('--------------------')
  const message = `こちらany警察👮‍♂️！${totalAnyDeclCount}件のanyをタイーホしました。`
  throw message
}
