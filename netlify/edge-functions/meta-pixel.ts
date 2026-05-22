import type { Context, Config } from "@netlify/edge-functions";

const META_PIXEL = `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '224071631616393932');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=224071631616393932&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;

export default async (req: Request, context: Context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();

  if (html.includes("fbevents.js")) {
    return new Response(html, response);
  }

  const injected = html.replace("<head>", `<head>\n${META_PIXEL}`);

  return new Response(injected, {
    status: response.status,
    headers: response.headers,
  });
};

export const config: Config = {
  path: "/*",
  excludedPath: ["/favicon.*", "/*.png", "/*.jpg", "/*.css", "/*.js", "/*.ico", "/*.xml", "/*.json"],
  onError: "bypass",
};
