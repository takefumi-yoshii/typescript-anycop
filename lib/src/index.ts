import * as ts from 'typescript'
import * as path from 'path'
import { removeUndefined } from './arrayFilters'
import { createApplicationResources } from './createApplicationResources'
import { getSourcesAnyDiagnostics } from './getSourcesAnyDiagnostics'
import { log } from './log'
// ______________________________________________________
//
// 対象となるプロジェクトのパス
const srcDir = path.resolve('../app')
const {
  program, // ts.Program
  checker // ts.TypeChecker
} = createApplicationResources(srcDir)

// tsconfig から得られた src ファイル名配列をもとに
// RootNode である ts.SourceFile の配列に変換
const sources: ts.SourceFile[] = program
  .getRootFileNames()
  .map(fileName => program.getSourceFile(fileName))
  .filter(removeUndefined)

if (sources.length) {
  // 少しでも any があればログ出力する
  const diagnostics = getSourcesAnyDiagnostics(checker, sources)
  if (diagnostics.coverage !== 1) {
    log(diagnostics)
  }
}
