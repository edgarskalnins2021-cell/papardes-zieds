# Šarlotes audumi — viena diena veikalā

Jautra spēle telefonā vai datorā: visi kolēģi ir saslimuši, un tev jāizvada veikala diena līdz 14:00.

**Spēlēt:** https://edgarskalnins2021-cell.github.io/papardes-zieds/sarlotes-audumi/

## Balsu pievienošana (ElevenLabs)
1. `Sarlotes_audumi_balsis.tsv` ir visi spēles teksti ar ID, runātāju un tekstu.
2. Ieraksti tekstu un saglabā kā `voice/<ID>.mp3`, piemēram `voice/c_ieva1.mp3`.
3. Ieraksti šo ID failā `voice/manifest.js`: `window.SA_VOICES = ["c_ieva1"];`
4. Spēle pati atskaņos balsi, kad parādās šis teksts. Ja faila nav, rāda tikai tekstu.

## Izstrādātājam
Avots ir mapē `avots/`: `python3 build.py` uztaisa `dist/index.html`; `python3 tests/flow.py` robots izspēlē visu dienu.
