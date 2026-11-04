import { beforeEach, describe, expect, it } from "vitest";

describe("Ambiente de testes Frontend (Vitest + jsdom)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve disponibilizar o objeto global document no ambiente jsdom", () => {
    expect(typeof document).toBe("object");
    expect(document.createElement).toBeTypeOf("function");

    const elemento = document.createElement("div");
    elemento.id = "elemento-teste";
    elemento.textContent = "Ambiente configurado";
    document.body.appendChild(elemento);

    expect(document.getElementById("elemento-teste")?.textContent).toBe(
      "Ambiente configurado"
    );
  });

  it("deve disponibilizar o objeto global window no ambiente jsdom", () => {
    expect(typeof window).toBe("object");
    expect(window.document).toBe(document);
  });

  it("deve permitir armazenar, recuperar e remover dados no localStorage", () => {
    const chave = "chave_teste_infra";
    const valor = JSON.stringify({ ok: true });

    localStorage.setItem(chave, valor);
    expect(localStorage.getItem(chave)).toBe(valor);

    localStorage.removeItem(chave);
    expect(localStorage.getItem(chave)).toBeNull();
  });
});
