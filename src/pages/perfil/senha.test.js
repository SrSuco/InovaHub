import { describe, expect, it } from 'vitest';
import { validarNovaSenha } from './validacaoSenha.js';

describe('validarNovaSenha', () => {
  it('aceita senha forte e confirmada', () => {
    expect(validarNovaSenha({ atual: 'inovahub', nova: 'parque2026', confirmacao: 'parque2026' })).toEqual({});
  });

  it('recusa senha curta, sem números ou não confirmada', () => {
    expect(validarNovaSenha({ atual: 'x', nova: 'abc', confirmacao: 'abc' }).nova).toMatch(/8 caracteres/);
    expect(validarNovaSenha({ atual: 'x', nova: 'somenteletras', confirmacao: 'somenteletras' }).nova).toMatch(/letras e números/);
    expect(validarNovaSenha({ atual: 'x', nova: 'parque2026', confirmacao: 'parque2025' }).confirmacao).toBeDefined();
  });
});
