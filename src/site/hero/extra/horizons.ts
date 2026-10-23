/**
 * „Zwei Horizonte“ (neu, nicht im Prototyp — Wunsch vom 23.10.2026, Vorlage: x.com/thtbee_ „Two Black Hole Horizons“,
 * dort in three.js nach zwei Referenzbildern). Hier als reiner Fragment-Shader ohne Bilder/Modelle:
 *  - Aurum: goldenes Schwarzes Loch (gelinste, schräge Akkretionsscheibe), Feld bei Nacht, Pickup und Holzhaus mit
 *    warm leuchtenden Fenstern, Sterne und Funken.
 *  - Viola: helles Schwarzes Loch mit fast kantenständiger Scheibe als gleißendes Band am Horizont, violettes
 *    Blumenfeld mit Lichtpunkten, sitzender Astronaut, unscharfe Blüten im Vordergrund.
 * Langsamer Kamera-Zoom und Zeiger-Parallaxe; links abgedunkelt, damit der Hero-Text lesbar bleibt.
 * Läuft über glMode (renderers.ts): u_time, u_res, u_mouse, hash/noise/fbm aus FS_HEAD.
 */

const COMMON = `
float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,d.y),0.0);}
float stars(vec2 p,float dens){vec2 g=floor(p*dens);vec2 f=fract(p*dens);float h=hash1(g);
 float s=step(0.982,h)*smoothstep(0.09,0.0,length(f-hash2(g)));return s*(0.55+0.45*sin(u_time*1.7+h*60.0));}
// Schwarzes Loch um p=0: R = Schattenradius, tilt = Neigung der Scheibe (klein = von der Kante), hot/warm = Farben.
// sh (out): 1 im Schatten. Vorderer Teil der Scheibe (unten) liegt über dem Schatten, der hintere wird verdeckt;
// sein gelinstes Bild umrahmt den Schatten als Bogen (oben am hellsten), dazu der dünne Photonenring.
vec3 hole(vec2 p,float R,float tilt,float reach,vec3 hot,vec3 warm,float t,out float sh){
 float r=length(p);float a=atan(p.y,p.x);
 sh=smoothstep(R*1.01,R*0.95,r);
 float up=smoothstep(-0.5,0.7,p.y/max(r,1e-4));
 float st=0.25+0.55*fbm(vec2(a*7.0-t*0.32,r*12.0/R))+0.45*pow(noise(vec2(a*26.0-t*0.9,r*18.0/R)),2.0);
 float halo=exp(-pow((r-R*1.32)/(R*0.30),2.0));
 float ring=exp(-pow((r-R*1.05)/(R*0.022),2.0));
 vec3 col=warm*halo*st*(0.2+1.15*up)+hot*ring*(0.35+0.75*up);
 col*=1.0-sh;
 vec2 e=vec2(p.x,p.y/tilt);float er=length(e);float ea=atan(e.y,e.x);
 float band=smoothstep(R*1.25,R*1.7,er)*smoothstep(R*reach,R*1.9,er);
 float ds=0.3+0.45*fbm(vec2(ea*6.0+t*0.22,er*5.0/R))+0.55*pow(noise(vec2(ea*24.0+t*0.7,er*10.0/R)),2.0);
 float dop=clamp(1.0-0.5*p.x/(R*2.5),0.45,1.7);
 vec3 disk=mix(warm,hot,smoothstep(R*3.2,R*1.4,er))*band*ds*dop;
 col+=disk*mix(1.0-sh,1.6,step(p.y,0.0));
 col+=warm*0.06*exp(-r/R*0.9);
 return col;
}
// Parallaxe + Kamerafahrt (sanftes Ein-/Auszoomen)
vec2 cam(vec2 uv,float depth){float z=1.0-0.06*sin(u_time*0.045);vec2 m=(u_mouse.xy/u_res-0.5)*0.035*depth;return uv*z+m;}
`;

const AURUM = `
vec3 aurum(vec2 uv0,float asp,float t){
 vec2 uv=cam(uv0,1.0);
 float hy=-0.30;
 vec2 c=vec2(asp>1.3?asp*0.17:0.0,-0.03);float R=asp>1.3?0.2:0.16;
 vec3 sky=mix(vec3(0.07,0.035,0.012),vec3(0.008,0.006,0.004),smoothstep(-0.3,0.55,uv.y));
 sky+=stars(uv+vec2(t*0.004,0.0),70.0)*vec3(1.0,0.85,0.6)*0.9;
 // Funken, die um das Loch ziehen
 vec2 q=uv-c;float qa=atan(q.y,q.x)+t*0.05;float qr=length(q);
 sky+=stars(vec2(qa*0.6,qr*1.6),40.0)*vec3(1.0,0.7,0.35)*smoothstep(0.9,0.3,qr)*0.8;
 float sh;vec3 h=hole(q,R,0.30,4.6,vec3(1.0,0.88,0.6),vec3(0.95,0.45,0.08),t,sh);
 vec3 col=sky*(1.0-sh)+h;
 float d=hy-uv.y;
 if(d>0.0){
  float grass=0.55*fbm(vec2(uv.x*90.0,uv.y*9.0/(d+0.05)))+0.45*noise(vec2(uv.x*320.0,uv.y*30.0));
  vec3 g=vec3(0.16,0.07,0.02)*grass*(0.5+0.5*exp(-d*5.0));
  g+=vec3(1.0,0.55,0.12)*exp(-d*16.0)*0.6*exp(-abs(uv.x-c.x)*1.4);
  col=g;
 }
 col+=vec3(1.0,0.62,0.22)*exp(-abs(d)*70.0)*0.4*exp(-abs(uv.x-c.x)*0.9);
 // Holzhaus rechts am Loch: Kasten + Dach, warme Fenster
 vec2 hp=uv-vec2(c.x+R*1.15,hy+0.034);
 float body=sdBox(hp,vec2(0.075,0.034));
 float roofW=0.085-(hp.y-0.034)*1.25;float roof=(hp.y>0.03&&hp.y<0.098&&abs(hp.x)<roofW)?-1.0:1.0;
 float chim=sdBox(hp-vec2(0.045,0.085),vec2(0.006,0.018));
 float sil=min(min(body,roof),chim);
 vec3 houseCol=vec3(0.035,0.018,0.008);
 if(sil<0.0){col=houseCol+vec3(0.5,0.22,0.05)*smoothstep(-0.01,0.0,sil)*0.6;
  vec2 wp=hp-vec2(0.0,-0.006);vec2 cell=vec2(0.024,0.026);vec2 id=floor(wp/cell+0.5);vec2 wf=wp-id*cell;
  if(abs(id.x)<=2.0&&id.y>=-0.0&&id.y<=0.0&&sdBox(wf,vec2(0.006,0.008))<0.0)col=vec3(1.0,0.7,0.32)*(0.8+0.2*sin(t*3.0+id.x*2.3));
  if(hp.y>0.045&&hp.y<0.068&&abs(hp.x)<0.03&&sdBox(vec2(mod(hp.x+0.03,0.022)-0.011,hp.y-0.056),vec2(0.005,0.007))<0.0)col=vec3(1.0,0.72,0.35);
 }
 col+=vec3(1.0,0.6,0.25)*0.25*exp(-max(sil,0.0)*90.0)*step(0.0,sil)*step(0.0,hp.y+0.034);
 // Pickup links
 vec2 tp=uv-vec2(c.x-R*1.05,hy+0.012);
 float tb=min(sdBox(tp,vec2(0.045,0.009)),sdBox(tp-vec2(0.012,0.014),vec2(0.016,0.009)));
 float wh=min(length(tp-vec2(-0.03,-0.011))-0.008,length(tp-vec2(0.03,-0.011))-0.008);
 if(min(tb,wh)<0.0)col=vec3(0.02,0.012,0.006)+vec3(0.6,0.3,0.08)*0.25*smoothstep(-0.006,0.0,tb);
 return col;
}`;

const VIOLA = `
vec3 viola(vec2 uv0,float asp,float t){
 vec2 uv=cam(uv0,1.0);
 float hy=-0.02;
 vec2 c=vec2(asp>1.3?asp*0.17:0.0,hy+0.09);float R=0.075;
 vec3 sky=mix(vec3(0.16,0.15,0.22),vec3(0.05,0.05,0.08),smoothstep(0.0,0.6,uv.y));
 sky+=stars(uv,60.0)*0.35;
 vec2 q=uv-c;float sh;vec3 h=hole(q,R,0.05,9.0,vec3(1.0,0.98,0.93),vec3(0.95,0.9,0.8),t,sh);
 vec3 col=sky*(1.0-sh*0.92)+h;
 float d=hy-uv.y;
 // Scheibe von der Kante: gleißendes Band am Horizont
 col+=vec3(1.0,0.96,0.88)*exp(-pow(d/0.022,2.0))*0.95*(0.55+0.45*exp(-abs(uv.x-c.x)*0.7));
 col+=vec3(0.92,0.88,0.86)*exp(-abs(d)*7.0)*0.22;
 if(d>0.012){
  // Blumenfeld in Perspektive: Zellen werden zum Horizont kleiner
  float z=0.05/(d+0.01)+0.9;vec2 fp=vec2(uv.x*z*42.0,z*30.0);
  vec2 gi=floor(fp);vec2 gf=fract(fp);float f=1e3;float hh=0.0;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j));vec2 rp=hash2(gi+o);
   float dd=length(o+rp-gf);if(dd<f){f=dd;hh=hash1(gi+o);}}
  vec3 petal=mix(vec3(0.20,0.12,0.42),vec3(0.42,0.30,0.72),hh);
  vec3 fc=mix(vec3(0.06,0.04,0.12),petal,smoothstep(0.55,0.15,f));
  fc+=vec3(1.0,0.82,0.45)*step(0.965,hh)*smoothstep(0.18,0.0,f)*(0.6+0.4*sin(t*2.0+hh*50.0));
  float haze=exp(-d*7.0);
  col=mix(fc*(0.55+0.6*haze),vec3(0.55,0.5,0.62),haze*0.55);
 }
 // Astronaut von hinten, sitzt im Feld (unten von Blumen verdeckt), Gegenlicht vom Horizont-Band
 vec2 ap=uv-vec2(c.x,hy-0.105);
 float helm=length(ap-vec2(0.0,0.052))-0.03;
 float torso=sdBox(ap-vec2(0.0,0.0),vec2(0.03,0.022))-0.017;
 float a=min(helm,torso);
 if(a<0.0&&ap.y>-0.03+0.006*sin(ap.x*180.0)){
  vec3 suit=vec3(0.16,0.15,0.2)*(0.7+0.5*smoothstep(0.03,-0.05,ap.x));
  float pack=sdBox(ap-vec2(0.0,0.004),vec2(0.016,0.014))-0.006;
  if(pack<0.0)suit*=0.82;
  suit+=vec3(0.85,0.82,0.86)*0.22*smoothstep(0.03,0.0,length(ap-vec2(-0.012,0.064)));
  suit+=vec3(1.0,0.96,0.9)*0.75*smoothstep(-0.005,0.0,a)*smoothstep(-0.01,0.04,ap.y);
  col=suit;
  col+=vec3(1.0,0.12,0.08)*smoothstep(0.004,0.0,length(ap-vec2(0.006,0.008)))*(0.7+0.3*sin(t*4.0));
 }
 // unscharfe Blüten im Vordergrund (Bokeh)
 for(int k=0;k<5;k++){float fk=float(k);vec2 bp=vec2((fk<2.5?-1.0:1.0)*asp*(0.32+0.07*fk)+0.02*sin(t*0.3+fk),-0.42+0.05*fk+0.01*cos(t*0.4+fk));
  float bd=length(uv0-bp);col+=vec3(0.95,0.92,0.95)*0.12*smoothstep(0.09,0.03,bd);}
 return col;
}`;

const main = (scene: string) => `${COMMON}${AURUM}${VIOLA}
void main(){vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;float asp=u_res.x/u_res.y;float t=u_time;
 float s=${scene};vec3 col;
 if(s<0.001)col=aurum(uv,asp,t);else if(s>0.999)col=viola(uv,asp,t);else col=mix(aurum(uv,asp,t),viola(uv,asp,t),s);
 // Hero-Text links lesbar halten, Vignette
 float x01=gl_FragCoord.x/u_res.x;
 col*=asp>1.3?mix(0.12,1.0,pow(smoothstep(0.24,0.72,x01),1.5)):0.38;
 col*=1.0-0.35*pow(length((gl_FragCoord.xy/u_res-0.5)*vec2(1.0,1.2)),2.2);
 gl_FragColor=vec4(pow(col,vec3(0.95)),1.0);}`;

export const HORIZON_SHADERS: Record<string, string> = {
  // beide Szenen im Wechsel (etwa alle 20 s, weiche Überblendung)
  horizons: main('smoothstep(0.35,0.65,0.5+0.5*sin(t*0.155))'),
  aurum: main('0.0'),
  viola: main('1.0'),
};
