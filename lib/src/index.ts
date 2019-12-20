import * as ts from 'typescript'
import * as path from 'path'
import { removeUndefined } from './arrayFilters'
import { createProgram } from './createProgram'
import { getAllAnyDiagnostics } from './getAllAnyDiagnostics'
import { log } from './log'
// ______________________________________________________
//
// 対象となるプロジェクトのパス
const srcDir = path.resolve('../app')
const program: ts.Program = createProgram(srcDir)
const checker: ts.TypeChecker = program.getTypeChecker()

// ts.Program から ts.SourceFile[] を捻出
const sources: ts.SourceFile[] = program
  .getRootFileNames()
  .map(fileName => program.getSourceFile(fileName))
  .filter(removeUndefined)

if (sources.length) {
  const diagnostics = getAllAnyDiagnostics(checker, sources)
  if (diagnostics.coverage !== 1) {
    // 少しでも any があればログ出力する
    log(diagnostics)
  }
}
