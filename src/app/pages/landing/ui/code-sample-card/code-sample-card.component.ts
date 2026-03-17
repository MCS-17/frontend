import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type CodeTab = 'mpi.job' | 'mpi.c';

@Component({
  selector: 'app-code-sample-card',
  imports: [NgOptimizedImage],
  templateUrl: './code-sample-card.component.html',
  styleUrl: './code-sample-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  }
})
export class CodeSampleCard {
  protected readonly tab = signal<CodeTab>('mpi.job');

  private readonly jobLines = [
    '#!/bin/bash',
    '#SBATCH --job-name=mpi',
    '#SBATCH --nodes=2',
    '#SBATCH --ntasks=4',
    '#SBATCH --cpus-per-task=1',
    '#SBATCH --ntasks-per-node=2',
    '#SBATCH --partition=defq',
    '',
    'module load openmpi/4.1.5',
    '',
    'mpicc mpi.c -o mpi',
    '',
    'srun mpi',
    'exit'
  ] as const;

  private readonly cLines = [
    '#include <mpi.h>',
    '#include <stdio.h>',
    '',
    'int main(int argc, char** argv) {',
    '  MPI_Init(&argc, &argv);',
    '',
    '  int rank = 0;',
    '  int size = 0;',
    '  MPI_Comm_rank(MPI_COMM_WORLD, &rank);',
    '  MPI_Comm_size(MPI_COMM_WORLD, &size);',
    '',
    '  printf("Hello from %d of %d\\n", rank, size);',
    '',
    '  MPI_Finalize();',
    '  return 0;',
    '}'
  ] as const;

  protected readonly codeLines = computed(() =>
    this.tab() === 'mpi.job' ? [...this.jobLines] : [...this.cLines]
  );

  protected readonly lineNumbers = computed(() =>
    Array.from({ length: this.codeLines().length }, (_, i) => i + 1)
  );

  protected setTab(tab: CodeTab) {
    this.tab.set(tab);
  }

  protected async copyToClipboard() {
    const text = this.codeLines().join('\n');
    await navigator.clipboard.writeText(text);
  }
}

