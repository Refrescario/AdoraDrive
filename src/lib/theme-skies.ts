import angels from "@/assets/ceu-anjos.png.asset.json";
import clouds from "@/assets/ceu-anjos-nuvens.png.asset.json";
import light from "@/assets/ceu-anjos-classicos.png.asset.json";
import hands from "@/assets/ceu-maos.png.asset.json";
import jesus from "@/assets/ceu-jesus.png.asset.json";
// ceu-nuvens, ceu-classico-* não existem localmente — usar substitutos
import dove from "@/assets/ceu-anjos-nuvens.png.asset.json";
import classicJesus from "@/assets/ceu-jesus.png.asset.json";
import classicAngel from "@/assets/ceu-anjos.png.asset.json";
import classicCross from "@/assets/ceu-anjos-classicos.png.asset.json";
import classicDove from "@/assets/ceu-anjos-nuvens.png.asset.json";

export const DESIGN_SKIES = {
  anjos: angels.url,
  "anjos-nuvens": clouds.url,
  "anjos-classicos": light.url,
  maos: hands.url,
  jesus: jesus.url,
  pomba: dove.url,
};
export const CLASSIC_SKIES = {
  jesus: classicJesus.url,
  anjo: classicAngel.url,
  cruz: classicCross.url,
  pomba: classicDove.url,
};