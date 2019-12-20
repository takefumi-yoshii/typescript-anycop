import * as ts from 'typescript'
import * as path from 'path'
import { removeUndefined } from './arrayFilters'
import { createApplicationResouces } from './createApplicationResouces'
import { getSourcesAnyDiagnostics } from './getSourcesAnyDiagnostics'

const srcDir = path.resolve('../app')
const {
  program, // ts.Program
  checker, // ts.TypeChecker
  parsedCommandLine // ts.ParsedCommandLine
} = createApplicationResouces(srcDir)

// tsconfig から得られた src ファイル名配列をもとに
// RootNode である ts.SourceFile の配列に変換
const sources: ts.SourceFile[] = parsedCommandLine.fileNames
  .map(fileName => program.getSourceFile(fileName))
  .filter(removeUndefined)

if (sources.length) {
  const {
    allAnyDeclCount,
    errorMessage,
    coverage
  } = getSourcesAnyDiagnostics(checker, sources)
  // 少しでも any があればログ出力する
  if (coverage !== 1) {
    console.log(errorMessage, coverage)
    const message = `こちらany警察👮‍♂️${allAnyDeclCount}件のany変数を発見しました`
    throw message
  }
}
