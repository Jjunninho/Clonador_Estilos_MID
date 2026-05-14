# 🧬 Clonador de Estilos MIDI

O **Clonador de Estilos MIDI** é uma ferramenta sofisticada de inteligência musical que analisa a estrutura de um arquivo MIDI de referência para gerar novas composições que preservem a "personalidade" e o estilo da obra original. Utilizando algoritmos avançados de análise tonal, a ferramenta consegue replicar padrões rítmicos e melódicos em novos contextos.

## 🚀 Funcionalidades Principais

- **Análise Tonal Avançada:** Implementação do algoritmo **Krumhansl-Schmuckler** para detecção precisa de tonalidade e modo (maior/menor).
- **Clonagem de Estilo:** Analisa arquivos `.mid` ou estruturas em `JSON` para extrair características como BPM, densidade de notas e instrumentação.
- **Variações Inteligentes:** Permite customizar a nova geração com opções como:
  - Manter ou variar andamento e tonalidade.
  - Ajustar densidade (mais notas ou mais espaço).
  - Transposição (mais agudo ou mais grave).
  - Intensidade (suave ou intenso).
- **Controle de Criatividade:** Slider para ajustar o nível de "ousadia" da IA na hora de gerar a nova peça.
- **Player e Exportação:** Ouça a clonagem diretamente no navegador e faça o download do novo arquivo MIDI.

## 🛠️ Tecnologias Utilizadas

- **JavaScript (Vanilla):** Lógica central de processamento de dados MIDI.
- **Algoritmo Krumhansl-Schmuckler:** Para análise estatística de distribuição de alturas e definição de tônica.
- **Tone.js:** Para reprodução de áudio e síntese dos instrumentos.
- **MidiWriterJS:** Para a geração e exportação dos novos arquivos `.mid`.

## 🎨 Como Usar

1. Acesse o [Clonador de Estilos](https://jjunninho.github.io/Clonador_Estilos_MID/).
2. Faça o upload de um arquivo **.mid** de referência (ex: um riff de Led Zeppelin ou Rolling Stones).
3. Escolha as variações desejadas (ex: "Mais intenso" ou "Variar melodia").
4. Ajuste o instrumento e a duração.
5. Clique em **CLONAR ESTILO**.
6. Ouça o resultado e clique em **Download MIDI**.

---
Desenvolvido por [Jjunninho](https://github.com/Jjunninho)
