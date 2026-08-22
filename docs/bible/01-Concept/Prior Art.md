# Prior Art

**Status:** `BUILT` — researched 2026-08-22, sources verified

The question asked: does an MMO like this already exist?

Answer: on desktop, yes, for forty years. On mobile with tap-native input, no.

## The desktop lineage

| Game | Note |
| --- | --- |
| Island of Kesmai (CompuServe, 1985) | Six-player roguelike-ASCII MUD. Direct forerunner of modern MMORPGs. |
| MAngband | Multiplayer Angband. Root of the modern branch. |
| TomeNET | Online multiplayer roguelike derived from MAngband. Still maintained. |
| Tangaria | Persistent online multiplayer roguelike on PWMAngband. Group PvE, trading, player economy, PvP. |
| Apsis Online | Small modern minimalist ASCII MMO. |

## The relevant finding

Every one of them hit our exact problem and solved it the same way: the
single-player games were turn-based, which was not feasible for multiplayer, so
they went real-time. TomeNET goes further and slows time on deeper levels to
compensate for speed gains.

That is a workaround for not having a scheduler that skips idle actors.
[[Tick Scheduler]] is a different answer to the same question.

## The gap

Mobile ASCII roguelikes are overwhelmingly keyboard ports with virtual d-pads.
One curated iOS list could name only a single traditional ASCII roguelike that
works without an external keyboard.

Nobody has built the tap grammar in [[Tap Input]], on phones, with co-op.

**The moat is not ASCII and not MMO. It is the tap grammar plus the scheduler.**

## Sources

- <https://en.wikipedia.org/wiki/Island_of_Kesmai>
- <https://github.com/TomenetGame/tomenet>
- <https://www.roguebasin.com/index.php/TomeNET>
- <http://tangaria.com/>
- <https://faction504.itch.io/apsis-online>
- <https://lazerwalker.com/ios-games-list/>
