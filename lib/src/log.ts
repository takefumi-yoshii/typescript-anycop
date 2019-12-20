import { SourcesAnyDiagnostics } from './getSourcesAnyDiagnostics'
export function log(diagnostics: SourcesAnyDiagnostics) {
  const {
    allVarDeclCount,
    allAnyDeclCount,
    errorMessage,
    coverage
  } = diagnostics
  console.log('--------------------')
  console.log(`allVarDeclCount: ${allVarDeclCount}`)
  console.log(`allAnyDeclCount: ${allAnyDeclCount}`)
  console.log(`coverage: ${coverage}`)
  console.log('--------------------')
  console.log(errorMessage)
  console.log('--------------------')
  const message = `こちらany警察👮‍♂️！${allAnyDeclCount}件のany変数を発見しました。`
  throw message
}
