import * as ts from 'typescript'
import * as path from 'path'
import { removeUndefined } from './arrayFilters'
import { createApplicationResouces } from './createApplicationResouces'
import { getSourcesAnyDiagnostics } from './getSourcesAnyDiagnostics'
import { log } from './log'
// ______________________________________________________
//
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
  // 少しでも any があればログ出力する
  const diagnostics = getSourcesAnyDiagnostics(checker, sources)
  if (diagnostics.coverage !== 1) {
    log(diagnostics)
  }
}
