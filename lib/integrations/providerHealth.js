import { getISportsProviderHealth } from "@/lib/sports/isports";
import { getYouTubeProviderHealth } from "@/lib/media/youtube";
import { getAIGatewayProviderHealth } from "@/lib/integrations/aiGateway";
import { getBalldontlieProviderHealth } from "@/lib/integrations/balldontlie";
import { getBraintrustProviderHealth } from "@/lib/integrations/braintrust";
import { getMuxProviderHealth } from "@/lib/integrations/mux";
import { getCoreSystemHealth } from "@/lib/integrations/systemHealth";
import { getGoogleSearchProviderHealth } from "@/lib/search/googleSearch";
import { getWeatherProviderHealth } from "@/lib/weather/openMeteo";

export async function getProviderHealthSnapshot() {
  const [
    sports,
    youtube,
    aiGateway,
    balldontlie,
    braintrust,
    mux,
    weather,
    googleSearch,
    system,
  ] = await Promise.all([
    getISportsProviderHealth(),
    getYouTubeProviderHealth(),
    getAIGatewayProviderHealth(),
    getBalldontlieProviderHealth(),
    getBraintrustProviderHealth(),
    getMuxProviderHealth(),
    getWeatherProviderHealth(),
    getGoogleSearchProviderHealth(),
    getCoreSystemHealth(),
  ]);

  return {
    checkedAt: new Date().toISOString(),
    sports,
    youtube,
    aiGateway,
    balldontlie,
    braintrust,
    mux,
    weather,
    googleSearch,
    system,
  };
}
