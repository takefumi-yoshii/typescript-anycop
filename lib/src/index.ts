import * as ts from 'typescript'
import * as path from 'path'
import { removeUndefined } from './arrayFilters'
import { createApplicationResources } from './createApplicationResources'
import { getAllAnyDiagnostics } from './getAllAnyDiagnostics'
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
  const diagnostics = getAllAnyDiagnostics(checker, sources)
  if (diagnostics.coverage !== 1) {
    log(diagnostics)
  }
}
