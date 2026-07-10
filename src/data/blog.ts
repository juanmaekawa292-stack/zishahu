 export interface BlogPost {
   slug: string;
   title_zhCN: string;
   title_zhTW: string;
   title_en: string;
   excerpt_zhCN: string;
   excerpt_zhTW: string;
   excerpt_en: string;
   content_zhCN: string;
   content_zhTW: string;
   content_en: string;
   category: "care" | "knowledge" | "tutorial" | "culture";
   image: string;
   createdAt: string;
   tags: string[];
 }
 
 export const blogPosts: BlogPost[] = [
   {
     slug: "yixing-zisha-care-guide",
     title_zhCN: "紫砂壶养护指南：从开壶到日常保养",
     title_zhTW: "紫砂壺養護指南：從開壺到日常保養",
     excerpt_zhCN:
       "一把好的紫砂壶需要悉心养护。本文将详细介绍紫砂壶的开壶方法、日常使用技巧和长期保养要点，帮助您的爱壶越养越温润�?,
     excerpt_zhTW:
       "一把好的紫砂壺需要悉心養護。本文將詳細介紹紫砂壺的開壺方法、日常使用技巧和長期保養要點，幫助您的愛壺越養越溫潤�?,
     content_zhCN: `<h2>为什么要养壶�?/h2>
 <p>紫砂壶之所以独特，在于它能在使用过程中逐渐吸收茶汤，形成温润如玉的包浆。一把养护得当的紫砂壶，不仅外观更加迷人，泡出的茶汤也会更加醇厚�?/p>
 
 <h2>第一步：开�?/h2>
 <p>新买的紫砂壶在使用前需要进�?开�?处理�?/p>
 <ol>
   <li><strong>清洗�?/strong>用温水将壶内外冲洗干净，去除烧制过程中的灰尘�?/li>
   <li><strong>温壶�?/strong>将壶放入锅中，加入清水没过壶身，小火�?0分钟，让壶身气孔充分打开�?/li>
   <li><strong>定味�?/strong>将壶捞出，放入您平时最常泡的茶叶，加水煮沸10分钟。这一步让壶身吸收茶味，日后泡茶更香�?/li>
   <li><strong>自然晾干�?/strong>将壶取出，倒扣在茶巾上自然晾干，切勿暴晒�?/li>
 </ol>
 
 <h2>日常使用要点</h2>
 <ul>
   <li><strong>一壶侍一茶：</strong>紫砂壶气孔丰富，容易吸附茶味。建议一把壶只泡一种茶，避免串味�?/li>
   <li><strong>冲泡前温壶：</strong>用热水淋壶身内外，既能清洁又能温壶，有利于茶香释放�?/li>
   <li><strong>及时清理�?/strong>泡完茶后立即倒出茶渣，用清水冲洗，不要使用洗洁精�?/li>
   <li><strong>保持通风�?/strong>洗净后倒扣放置，保持壶内通风干燥，避免异味�?/li>
 </ul>
 
 <h2>养壶的误�?/h2>
 <p><strong>误区一�?/strong>用茶汤浇淋壶身就能养壶。其实茶汤中的茶垢容易堵塞壶身气孔，影响透气性�?/p>
 <p><strong>误区二：</strong>养壶就要天天泡茶。紫砂壶也需要休息，偶尔让它"歇一�?有助于保持最佳状态�?/p>
 <p><strong>误区三：</strong>用刷子用力刷壶身。这会损伤壶表面的包浆，用柔软的茶巾轻轻擦拭即可�?/p>`,
     content_zhTW: `<h2>為什麼要養壺�?/h2>
 <p>紫砂壺之所以獨特，在於它能在使用過程中逐漸吸收茶湯，形成溫潤如玉的包漿。一把養護得當的紫砂壺，不僅外觀更加迷人，泡出的茶湯也會更加醇厚�?/p>
 
 <h2>第一步：開壺</h2>
 <p>新買的紫砂壺在使用前需要進行「開壺」處理：</p>
 <ol>
   <li><strong>清洗�?/strong>用溫水將壺內外沖洗乾淨，去除燒製過程中的灰塵�?/li>
   <li><strong>溫壺�?/strong>將壺放入鍋中，加入清水沒過壺身，小火�?0分鐘，讓壺身氣孔充分打開�?/li>
   <li><strong>定味�?/strong>將壺撈出，放入您平時最常泡的茶葉，加水煮沸10分鐘。這一步讓壺身吸收茶味，日後泡茶更香�?/li>
   <li><strong>自然晾乾�?/strong>將壺取出，倒扣在茶巾上自然晾乾，切勿暴曬�?/li>
 </ol>
 
 <h2>日常使用要點</h2>
 <ul>
   <li><strong>一壺侍一茶：</strong>紫砂壺氣孔豐富，容易吸附茶味。建議一把壺只泡一種茶，避免串味�?/li>
   <li><strong>沖泡前溫壺：</strong>用熱水淋壺身內外，既能清潔又能溫壺，有利於茶香釋放�?/li>
   <li><strong>及時清理�?/strong>泡完茶後立即倒出茶渣，用清水沖洗，不要使用洗潔精�?/li>
   <li><strong>保持通風�?/strong>洗淨後倒扣放置，保持壺內通風乾燥，避免異味�?/li>
 </ul>
 
 <h2>養壺的誤區</h2>
 <p><strong>誤區一�?/strong>用茶湯澆淋壺身就能養壺。其實茶湯中的茶垢容易堵塞壺身氣孔，影響透氣性�?/p>
 <p><strong>誤區二：</strong>養壺就要天天泡茶。紫砂壺也需要休息，偶爾讓它「歇一歇」有助於保持最佳狀態�?/p>
 <p><strong>誤區三：</strong>用刷子用力刷壺身。這會損傷壺表面的包漿，用柔軟的茶巾輕輕擦拭即可�?/p>
    title_en: "How to Season and Care for Your Yixing Zisha Teapot: A Complete Guide",
    excerpt_en: "A great Yixing teapot needs proper care. This guide covers everything from seasoning (kaihu) your new pot to daily maintenance and long-term patina development. Learn how to keep your zisha teapot in perfect condition.",
    content_en: `<h2>Why Care for Your Zisha Teapot?</h2>
<p>What makes Yixing zisha teapots special is their ability to absorb tea oils over time, gradually developing a rich, jade-like patina (baojiang). A well-cared-for teapot does not just look more beautiful - it also brews better tea, as the seasoned clay enhances the flavor and aroma with each use.</p>

<p>Unlike glazed ceramics, unglazed zisha clay is porous. Each tiny pore breathes and interacts with the tea, which is why proper care - not neglect - is the secret to a truly great teapot.</p>

<h2>Step 1: Seasoning Your New Teapot (Kaihu)</h2>
<p>A brand-new Yixing teapot needs to be 'seasoned' before its first use. This process, known in Chinese as kaihu (opening the pot), removes kiln dust and prepares the clay for brewing.</p>
<ol>
  <li><strong>Rinse thoroughly:</strong> Wash the inside and outside of the pot with warm water to remove any dust or residue from the firing process. No soap - ever.</li>
  <li><strong>Gentle simmer:</strong> Place the teapot in a pot of clean water, fully submerged. Simmer (do not boil aggressively) for 30 minutes. This opens up the clay pores and removes any remaining kiln grit.</li>
  <li><strong>Tea bath:</strong> After simmering, add the type of tea you plan to brew most often to the water and simmer for another 10 minutes. This allows the clay to absorb the tea essence, setting the foundation for future brews.</li>
  <li><strong>Air dry naturally:</strong> Remove the teapot, rinse it gently with warm water, and place it upside down on a tea towel to dry. Never expose it to direct sunlight or artificial heat.</li>
</ol>

<h2>Daily Use Tips</h2>
<ul>
  <li><strong>One teapot, one tea:</strong> Zisha clay is highly porous and will absorb the flavor of whatever tea you brew. Dedicate each teapot to a single type of tea (oolong, puer, black tea, etc.) to avoid flavor crossover.</li>
  <li><strong>Pre-warm your pot:</strong> Before brewing, rinse the inside and outside of the pot with hot water. This prepares the clay for the brewing temperature and helps release the tea aroma.</li>
  <li><strong>Clean immediately after use:</strong> Empty the leaves promptly, rinse the pot with hot water, and let it dry. Never use dish soap or detergent - the porous clay will absorb the chemicals.</li>
  <li><strong>Keep it ventilated:</strong> Store your teapot with the lid off in a well-ventilated area. A dry, airy environment prevents musty odors and mold.</li>
</ul>

<h2>Common Care Misconceptions</h2>
<p><strong>Myth 1: Pouring tea broth over your pot will build patina faster.</strong> Actually, the sugars and tannins in the tea broth can clog the clay pores, reducing breathability. The patina should develop naturally from the inside out through regular brewing.</p>
<p><strong>Myth 2: You need to brew tea every single day to keep your pot healthy.</strong> Zisha teapots benefit from rest. Letting your pot 'breathe' for a day or two between uses maintains optimal performance.</p>
<p><strong>Myth 3: Scrub the exterior with a brush to keep it clean.</strong> Scrubbing damages the delicate patina layer. Simply wipe the exterior with a soft tea cloth after each use - gentle care is all it needs.</p>`,
    category:category: "care",
     image: "/images/blog/zisha-care.jpg",
     createdAt: "2026-06-01",
     tags: ["紫砂壶养�?, "开�?, "养壶", "Yixing teapot care", "zisha maintenance"],
   },
   {
     slug: "yixing-clay-types",
     title_zhCN: "宜兴紫砂泥料科普：紫泥、朱泥、段泥的区别",
     title_zhTW: "宜興紫砂泥料科普：紫泥、朱泥、段泥的區�?,
     excerpt_zhCN:
       "紫砂泥料种类繁多，紫泥、朱泥、段泥是三大主流。它们各有何特点？分别适合泡什么茶？一篇搞懂�?,
     excerpt_zhTW:
       "紫砂泥料種類繁多，紫泥、朱泥、段泥是三大主流。它們各有何特點？分別適合泡什麼茶？一篇搞懂�?,
     content_zhCN: `<h2>三大泥料概览</h2>
 <p>宜兴紫砂泥料主要分为三大类：紫泥、朱泥和段泥（也称团泥）。每种泥料的矿物组成、烧制温度和成品特性都不同�?/p>
 
 <h2>紫泥</h2>
 <p><strong>特点�?/strong>紫泥是宜兴储量最丰富的泥料，颜色呈紫褐色或猪肝色。紫泥壶透气性极佳，吸水率高，适合培养包浆�?/p>
 <p><strong>适合冲泡�?/strong>乌龙茶（铁观音、大红袍）、普洱茶、红茶。紫泥的透气性能够很好地激发高香型茶叶的香气�?/p>
 <p><strong>代表作品�?/strong>西施壶、石瓢壶是紫泥的经典代表�?/p>
 
 <h2>朱泥</h2>
 <p><strong>特点�?/strong>朱泥颜色呈朱红色或橙色，质地细腻，含铁量高，烧制收缩率大（可�?5%），因此朱泥壶多为小型壶�?/p>
 <p><strong>适合冲泡�?/strong>乌龙茶（铁观音、凤凰单丛）、高山茶。朱泥密度高、聚香性好，适合泡高香型茶叶�?/p>
 <p><strong>注意�?/strong>朱泥壶不耐骤冷骤热，使用前务必先用热水温壶�?/p>
 
 <h2>段泥</h2>
 <p><strong>特点�?/strong>段泥是紫泥和绿泥的共生矿，颜色从米黄到青灰不等。段泥壶颜色清雅，颗粒感明显�?/p>
 <p><strong>适合冲泡�?/strong>生普洱茶、绿茶、白茶。段泥颜色浅，适合泡汤色清淡的茶类，能很好的衬托茶汤色泽�?/p>
 <p><strong>养护�?/strong>段泥壶较易吸附茶渍，泡深色茶后需要及时清洗�?/p>`,
     content_zhTW: `<h2>三大泥料概覽</h2>
 <p>宜興紫砂泥料主要分為三大類：紫泥、朱泥和段泥（也稱團泥）。每種泥料的礦物組成、燒製溫度和成品特性都不同�?/p>
 
 <h2>紫泥</h2>
 <p><strong>特點�?/strong>紫泥是宜興儲量最豐富的泥料，顏色呈紫褐色或豬肝色。紫泥壺透氣性極佳，吸水率高，適合培養包漿�?/p>
 <p><strong>適合沖泡�?/strong>烏龍茶（鐵觀音、大紅袍）、普洱茶、紅茶。紫泥的透氣性能夠很好地激發高香型茶葉的香氣�?/p>
 <p><strong>代表作品�?/strong>西施壺、石瓢壺是紫泥的經典代表�?/p>
 
 <h2>朱泥</h2>
 <p><strong>特點�?/strong>朱泥顏色呈朱紅色或橙色，質地細膩，含鐵量高，燒製收縮率大（可�?5%），因此朱泥壺多為小型壺�?/p>
 <p><strong>適合沖泡�?/strong>烏龍茶（鐵觀音、鳳凰單樅）、高山茶。朱泥密度高、聚香性好，適合泡高香型茶葉�?/p>
 <p><strong>注意�?/strong>朱泥壺不耐驟冷驟熱，使用前務必先用熱水溫壺�?/p>
 
 <h2>段泥</h2>
 <p><strong>特點�?/strong>段泥是紫泥和綠泥的共生礦，顏色從米黃到青灰不等。段泥壺顏色清雅，顆粒感明顯�?/p>
 <p><strong>適合沖泡�?/strong>生普洱茶、綠茶、白茶。段泥顏色淺，適合泡湯色清淡的茶類，能很好的襯托茶湯色澤�?/p>
 <p><strong>養護�?/strong>段泥壺較易吸附茶漬，泡深色茶後需要及時清洗�?/p>`,
     category: "knowledge",
     image: "/images/blog/clay-types.jpg",
     createdAt: "2026-06-05",
     tags: ["紫砂泥料", "紫泥", "朱泥", "段泥", "Yixing clay", "zisha clay types"],
   },
   {
     slug: "gongfu-tea-brewing",
     title_zhCN: "功夫茶冲泡教程：用紫砂壶泡出一杯好�?,
     title_zhTW: "功夫茶沖泡教程：用紫砂壺泡出一杯好�?,
     excerpt_zhCN:
       "功夫茶讲究的是“和、敬、清、寂”的境界。本文将手把手教您用紫砂壶冲泡功夫茶，从温壶到品茗，每一步都有讲究�?,
     excerpt_zhTW:
       "功夫茶講究的是「和、敬、清、寂」的境界。本文將手把手教您用紫砂壺沖泡功夫茶，從溫壺到品茗，每一步都有講究�?,
     content_zhCN: `<h2>准备工作</h2>
 <p>冲泡功夫茶需要以下器具：紫砂壶（容量100-200ml为宜）、公道杯、品茗杯（三个）、茶盘、茶巾、茶则、茶针�?/p>
 
 <h2>步骤一：温壶温�?/h2>
 <p>将沸水注入紫砂壶中，盖盖后淋壶身，使壶身内外均匀受热。同时用温壶的水温烫公道杯和品茗杯。这一步不仅能清洁器具，还能提升茶香释放�?/p>
 
 <h2>步骤二：投茶</h2>
 <p>用茶则将茶叶拨入壶中。投茶量一般为壶容量的1/3�?/2，具体根据茶叶种类和个人口味调整。乌龙茶约为壶容量的1/3，普洱茶可适当多一些�?/p>
 
 <h2>步骤三：醒茶</h2>
 <p>将沸水注入壶中，即刻倒出，称�?洗茶"�?醒茶"。这一步可以唤醒茶叶，去除浮尘，为正式冲泡做准备�?/p>
 
 <h2>步骤四：冲泡</h2>
 <p>再次将沸水注入壶中，注水时沿着壶壁缓缓注入，避免直接冲击茶叶。盖盖后根据茶叶种类控制出汤时间�?/p>
 <ul>
   <li>铁观音：15-20�?/li>
   <li>大红袍：20-30�?/li>
   <li>普洱茶：10-15秒（快速出汤）</li>
 </ul>
 
 <h2>步骤五：品茗</h2>
 <p>将茶汤通过公道杯均匀分入品茗杯中，先闻香，再观色，最后品茗。功夫茶讲究"三口�?：一品茶汤滋味，二品茶香余韵，三品茶之精神�?/p>`,
     content_zhTW: `<h2>準備工作</h2>
 <p>沖泡功夫茶需要以下器具：紫砂壺（容量100-200ml為宜）、公道杯、品茗杯（三個）、茶盤、茶巾、茶則、茶針�?/p>
 
 <h2>步驟一：溫壺溫�?/h2>
 <p>將沸水注入紫砂壺中，蓋蓋後淋壺身，使壺身內外均勻受熱。同時用溫壺的水溫燙公道杯和品茗杯。這一步不僅能清潔器具，還能提升茶香釋放�?/p>
 
 <h2>步驟二：投茶</h2>
 <p>用茶則將茶葉撥入壺中。投茶量一般為壺容量的1/3�?/2，具體根據茶葉種類和個人口味調整。烏龍茶約為壺容量的1/3，普洱茶可適當多一些�?/p>
 
 <h2>步驟三：醒茶</h2>
 <p>將沸水注入壺中，即刻倒出，稱為「洗茶」或「醒茶」。這一步可以喚醒茶葉，去除浮塵，為正式沖泡做準備�?/p>
 
 <h2>步驟四：沖泡</h2>
 <p>再次將沸水注入壺中，注水時沿著壺壁緩緩注入，避免直接衝擊茶葉。蓋蓋後根據茶葉種類控制出湯時間�?/p>
 <ul>
   <li>鐵觀音：15-20�?/li>
   <li>大紅袍：20-30�?/li>
   <li>普洱茶：10-15秒（快速出湯）</li>
 </ul>
 
 <h2>步驟五：品茗</h2>
 <p>將茶湯通過公道杯均勻分入品茗杯中，先聞香，再觀色，最後品茗。功夫茶講究「三口品」：一品茶湯滋味，二品茶香餘韻，三品茶之精神�?/p>`,
     category: "tutorial",
     image: "/images/blog/gongfu-brewing.jpg",
     createdAt: "2026-06-08",
     tags: ["功夫�?, "冲泡教程", "紫砂壶泡�?, "gongfu tea", "tea brewing guide"],
   },
   {
     slug: "zisha-teapot-appreciation",
     title_zhCN: "如何鉴赏紫砂壶：从泥料到工艺",
     title_zhTW: "如何鑑賞紫砂壺：從泥料到工藝",
     excerpt_zhCN:
       "紫砂壶鉴赏是一门学问。一把真正的好壶，需要从泥料、造型、工艺、实用性等四个维度来综合评判�?,
     excerpt_zhTW:
       "紫砂壺鑑賞是一門學問。一把真正的好壺，需要從泥料、造型、工藝、實用性等四個維度來綜合評判�?,
     content_zhCN: `<h2>一看泥�?/h2>
 <p>正宗宜兴紫砂泥料色泽温润自然，不刺眼。真紫砂泥料表面有细微的颗粒感（砂粒感），而化工泥料过于细腻均匀，没有天然砂粒�?/p>
 <p>原矿紫砂颜色多为紫褐色、朱红色、米黄色等自然色系，颜色过于鲜艳的需警惕添加了着色剂�?/p>
 
 <h2>二看造型</h2>
 <p>紫砂壶的造型讲究"比例协调、线条流�?。经典的壶型如西施壶、石瓢壶经过数百年传承，每一个线条比例都是经过反复推敲的�?/p>
 <p>好壶给人以视觉上的舒适感：壶嘴与壶把在一条直线上，壶盖与壶口严丝合缝，转动时平稳不摇晃�?/p>
 
 <h2>三看工艺</h2>
 <p>全手工壶和半手工壶都是正当的制作方式。全手工壶（全手工成型）每把都是独一无二的，价格较高。半手工壶借助模具成型，效率更高，性价比好�?/p>
 <p>关键看做工细节：壶嘴内壁是否光滑（影响出水）、壶盖与壶口的吻合度、壶底的工整程度�?/p>
 
 <h2>四看实用�?/h2>
 <p>一把好壶不仅要好看，更要好用：</p>
 <ul>
   <li>壶嘴出水是否流畅有力，断水是否干�?/li>
   <li>壶盖是否容易滑落（好的壶盖有适当的阻尼）</li>
   <li>壶把设计是否符合人体工学，端拿是否舒�?/li>
   <li>容量是否适合您的使用场景</li>
 </ul>`,
     content_zhTW: `<h2>一看泥�?/h2>
 <p>正宗宜興紫砂泥料色澤溫潤自然，不刺眼。真紫砂泥料表面有細微的顆粒感（砂粒感），而化工泥料過於細膩均勻，沒有天然砂粒�?/p>
 <p>原礦紫砂顏色多為紫褐色、朱紅色、米黃色等自然色系，顏色過於鮮豔的需警惕添加了著色劑�?/p>
 
 <h2>二看造型</h2>
 <p>紫砂壺的造型講究「比例協調、線條流暢」。經典的壺型如西施壺、石瓢壺經過數百年傳承，每一個線條比例都是經過反覆推敲的�?/p>
 <p>好壺給人以視覺上的舒適感：壺嘴與壺把在一條直線上，壺蓋與壺口嚴絲合縫，轉動時平穩不搖晃�?/p>
 
 <h2>三看工藝</h2>
 <p>全手工壺和半手工壺都是正當的製作方式。全手工壺（全手工成型）每把都是獨一無二的，價格較高。半手工壺藉助模具成型，效率更高，性價比好�?/p>
 <p>關鍵看做工細節：壺嘴內壁是否光滑（影響出水）、壺蓋與壺口的吻合度、壺底的工整程度�?/p>
 
 <h2>四看實用�?/h2>
 <p>一把好壺不僅要好看，更要好用：</p>
 <ul>
   <li>壺嘴出水是否流暢有力，斷水是否乾�?/li>
   <li>壺蓋是否容易滑落（好的壺蓋有適當的阻尼）</li>
   <li>壺把設計是否符合人體工學，端拿是否舒�?/li>
   <li>容量是否適合您的使用場景</li>
 </ul>`,
     category: "knowledge",
     image: "/images/blog/appreciation.jpg",
     createdAt: "2026-06-10",
     tags: ["紫砂壶鉴�?, "鉴别真假", "手工�?, "zisha appreciation", "yixing authentication"],
   },
  {
    slug: "how-to-choose-first-zisha-teapot",
    title_zhCN: "新手必看：如何选择人生第一把紫砂壶",
    title_zhTW: "新手必看：如何選擇人生第一把紫砂壺",
    excerpt_zhCN: "面对琳琅满目的紫砂壶，新手该如何挑选？从预算、泥料、壶型、工艺四个维度，手把手教你选出适合自己的一把好壶�?,
    excerpt_zhTW: "面對琳瑯滿目的紫砂壺，新手該如何挑選？從預算、泥料、壺型、工藝四個維度，手把手教你選出適合自己的一把好壺�?,
    content_zhCN: `<h2>第一步：确定预算</h2>
<p>紫砂壶的价格从几百到几十万不等，新手建议从入门级开始：</p>
<ul>
  <li><strong>入门级（500-2000元）�?/strong>半手工壶为主，泥料正宗，做工规整�?/li>
  <li><strong>进阶级（2000-8000元）�?/strong>全手工壶或名家徒工壶，泥料精良�?/li>
  <li><strong>收藏级（8000元以上）�?/strong>全手工名家壶，兼具实用与收藏价值�?/li>
</ul>
<p>新手建议�?00-1500元的半手工壶入手，先培养手感�?/p>

<h2>第二步：选泥�?/h2>
<p>不同泥料适合不同的泡茶需求：</p>
<ul>
  <li><strong>紫泥�?/strong>透气性最佳，适合泡乌龙茶、普洱熟茶。紫泥壶养出来温润如玉�?/li>
  <li><strong>朱泥�?/strong>密度高、聚香好，适合泡高香乌龙茶（铁观音、凤凰单丛）。使用前必须温壶�?/li>
  <li><strong>段泥�?/strong>颜色清雅，适合泡普洱生茶、绿茶、白茶。泡深色茶后需及时清洗�?/li>
</ul>
<p>新手首推紫泥壶，容错率高，养护容易�?/p>

<h2>第三步：选壶�?/h2>
<ul>
  <li><strong>石瓢壶：</strong>三角形结构，稳重大气，出水爽利，适合各种茶类�?/li>
  <li><strong>西施壶：</strong>圆润饱满，倒把设计，适合乌龙茶和红茶�?/li>
  <li><strong>仿古壶：</strong>线条流畅，容量适中，日常泡茶首选�?/li>
  <li><strong>容天壶：</strong>大肚能容，适合泡普洱茶�?/li>
</ul>
<p>新手建议�?00ml左右的石瓢或仿古壶开始�?/p>

<h2>第四步：检查工�?/h2>
<ol>
  <li>盖子与口紧密贴合，转动平稳不晃动</li>
  <li>出水水柱圆润有力，断水干净利落</li>
  <li>壶嘴内壁光滑无毛�?/li>
  <li>壶底放在桌面上平稳不�?/li>
  <li>表面有细微砂粒感，过于光滑可能是化工�?/li>
</ol>`,
    content_zhTW: `<h2>第一步：確定預算</h2>
<p>紫砂壺的價格從幾百到幾十萬不等，新手建議從入門級開始：</p>
<ul>
  <li><strong>入門級（500-2000元）�?/strong>半手工壺為主，泥料正宗，做工規整�?/li>
  <li><strong>進階級（2000-8000元）�?/strong>全手工壺或名家徒工壺，泥料精良�?/li>
  <li><strong>收藏級（8000元以上）�?/strong>全手工名家壺，兼具實用與收藏價值�?/li>
</ul>
<p>新手建議�?00-1500元的半手工壺入手，先培養手感�?/p>

<h2>第二步：選泥�?/h2>
<p>不同泥料適合不同的泡茶需求：</p>
<ul>
  <li><strong>紫泥�?/strong>透氣性最佳，適合泡烏龍茶、普洱熟茶。紫泥壺養出來溫潤如玉�?/li>
  <li><strong>朱泥�?/strong>密度高、聚香好，適合泡高香烏龍茶（鐵觀音、鳳凰單叢）。使用前必須溫壺�?/li>
  <li><strong>段泥�?/strong>顏色清雅，適合泡普洱生茶、綠茶、白茶。泡深色茶後需及時清洗�?/li>
</ul>
<p>新手首推紫泥壺，容錯率高，養護容易�?/p>

<h2>第三步：選壺�?/h2>
<ul>
  <li><strong>石瓢壺：</strong>三角形結構，穩重大氣，出水爽利，適合各種茶類�?/li>
  <li><strong>西施壺：</strong>圓潤飽滿，倒把設計，適合烏龍茶和紅茶�?/li>
  <li><strong>仿古壺：</strong>線條流暢，容量適中，日常泡茶首選�?/li>
  <li><strong>容天壺：</strong>大肚能容，適合泡普洱茶�?/li>
</ul>
<p>新手建議�?00ml左右的石瓢或仿古壺開始�?/p>

<h2>第四步：檢查工藝</h2>
<ol>
  <li>蓋子與口緊密貼合，轉動平穩不晃動</li>
  <li>出水水柱圓潤有力，斷水乾淨利�?/li>
  <li>壺嘴內壁光滑無毛�?/li>
  <li>壺底放在桌面上平穩不�?/li>
  <li>表面有細微砂粒感，過於光滑可能是化工�?/li>
</ol>`,
    category: "knowledge",
    image: "/images/blog/choose-first-teapot.jpg",
    createdAt: "2026-06-12",
    tags: ["紫砂壶选购", "新手紫砂�?, "first zisha teapot", "beginners guide"],
  },
  {
    slug: "zisha-teapot-tea-pairing-guide",
    title_zhCN: "一壶一茶：紫砂壶和不同茶类的搭配指�?,
    title_zhTW: "一壺一茶：紫砂壺和不同茶類的搭配指�?,
    excerpt_zhCN: "紫砂壶讲究一壶一茶，不同泥料、不同壶型适合泡什么茶？为你详细解读紫砂壶与茶类的搭配奥秘�?,
    excerpt_zhTW: "紫砂壺講究一壺一茶，不同泥料、不同壺型適合泡什麼茶？為你詳細解讀紫砂壺與茶類的搭配奧秘�?,
    content_zhCN: `<h2>为什么提倡一壶一茶？</h2>
<p>紫砂壶的双气孔结构能吸附茶汤中的物质。长期用同一把壶泡同一种茶，壶身会逐渐吸收茶香，使泡出的茶汤更加醇厚�?/p>

<h2>紫泥�?× 乌龙�?/ 普洱熟茶</h2>
<p>紫泥透气性极佳，能很好地激发高香型茶叶的香气，柔化茶汤的苦涩感�?/p>
<ul>
  <li><strong>武夷岩茶（大红袍、肉桂）�?/strong>紫泥壶让岩茶的岩韵充分释放�?/li>
  <li><strong>铁观音（浓香型）�?/strong>紫泥能保持铁观音的醇厚口感�?/li>
  <li><strong>普洱熟茶�?/strong>紫泥的吸附性可去除熟茶的堆味�?/li>
</ul>
<p><em>推荐壶型：石瓢壶、仿古壶�?00ml左右�?/em></p>

<h2>朱泥�?× 高香乌龙�?/ 红茶</h2>
<p>朱泥密度高、导热快、聚香效果好，是冲泡高香型茶叶的利器�?/p>
<ul>
  <li><strong>铁观音（清香型）�?/strong>朱泥的高密度能锁住兰花香�?/li>
  <li><strong>凤凰单丛�?/strong>聚香效果让单丛层次感更分明�?/li>
  <li><strong>正山小种、金骏眉�?/strong>朱泥壶能很好展现红茶的蜜香和果香�?/li>
</ul>
<p><em>注意：朱泥壶使用前必须温壶，避免冷热冲击导致开裂�?/em></p>

<h2>段泥�?× 普洱生茶 / 绿茶 / 白茶</h2>
<p>段泥颜色清雅，适合冲泡汤色清亮的茶类�?/p>
<ul>
  <li><strong>普洱生茶�?/strong>段泥壶的浅色内壁能衬托生茶汤色的变化�?/li>
  <li><strong>西湖龙井、碧螺春�?/strong>段泥壶散热快，不易闷坏绿茶�?/li>
  <li><strong>白毫银针、白牡丹�?/strong>清雅的白茶与段泥相得益彰�?/li>
</ul>
<p><em>注意：段泥壶颜色浅，泡深色茶后需及时清洗�?/em></p>`,
    content_zhTW: `<h2>為什麼提倡一壺一茶？</h2>
<p>紫砂壺的雙氣孔結構能吸附茶湯中的物質。長期用同一把壺泡同一種茶，壺身會逐漸吸收茶香，使泡出的茶湯更加醇厚�?/p>

<h2>紫泥�?× 烏龍�?/ 普洱熟茶</h2>
<p>紫泥透氣性極佳，能很好地激發高香型茶葉的香氣，柔化茶湯的苦澀感�?/p>
<ul>
  <li><strong>武夷岩茶（大紅袍、肉桂）�?/strong>紫泥壺讓岩茶的岩韻充分釋放�?/li>
  <li><strong>鐵觀音（濃香型）�?/strong>紫泥能保持鐵觀音的醇厚口感�?/li>
  <li><strong>普洱熟茶�?/strong>紫泥的吸附性可去除熟茶的堆味�?/li>
</ul>
<p><em>推薦壺型：石瓢壺、仿古壺�?00ml左右�?/em></p>

<h2>朱泥�?× 高香烏龍�?/ 紅茶</h2>
<p>朱泥密度高、導熱快、聚香效果好，是沖泡高香型茶葉的利器�?/p>
<ul>
  <li><strong>鐵觀音（清香型）�?/strong>朱泥的高密度能鎖住蘭花香�?/li>
  <li><strong>鳳凰單叢�?/strong>聚香效果讓單叢層次感更分明�?/li>
  <li><strong>正山小種、金駿眉�?/strong>朱泥壺能很好展現紅茶的蜜香和果香�?/li>
</ul>
<p><em>注意：朱泥壺使用前必須溫壺，避免冷熱衝擊導致開裂�?/em></p>

<h2>段泥�?× 普洱生茶 / 綠茶 / 白茶</h2>
<p>段泥顏色清雅，適合沖泡湯色清亮的茶類�?/p>
<ul>
  <li><strong>普洱生茶�?/strong>段泥壺的淺色內壁能襯托生茶湯色的變化�?/li>
  <li><strong>西湖龍井、碧螺春�?/strong>段泥壺散熱快，不易悶壞綠茶�?/li>
  <li><strong>白毫銀針、白牡丹�?/strong>清雅的白茶與段泥相得益彰�?/li>
</ul>
<p><em>注意：段泥壺顏色淺，泡深色茶後需及時清洗�?/em></p>`,
    category: "knowledge",
    image: "/images/blog/tea-pairing.jpg",
    createdAt: "2026-06-12",
    tags: ["一壶一�?, "紫砂壶搭�?, "tea pairing", "zisha teapot tea"],
  },
  {
    slug: "yixing-zisha-history",
    title_zhCN: "宜兴紫砂壶的历史：六百年窑火传承",
    title_zhTW: "宜興紫砂壺的歷史：六百年窯火傳承",
    excerpt_zhCN: "从明代正德年间到现代，宜兴紫砂壶走过了六百年的辉煌历史。了解紫砂壶的起源、兴盛与传承�?,
    excerpt_zhTW: "從明代正德年間到現代，宜興紫砂壺走過了六百年的輝煌歷史。了解紫砂壺的起源、興盛與傳承�?,
    content_zhCN: `<h2>起源：明代正德年�?/h2>
<p>紫砂壶的历史可追溯到明代正德年间�?506-1521年）。供春被誉为紫砂壶始祖，他制作的供春壶以树瘿为造型灵感，开创了紫砂壶仿生造型的先河�?/p>

<h2>兴盛：明末清�?/h2>
<ul>
  <li><strong>时大彬：</strong>紫砂史上最具影响力的大师之一，首创了调砂技法�?/li>
  <li><strong>陈鸣远：</strong>擅长花器，将自然界的瓜果、竹木元素融入紫砂创作�?/li>
  <li><strong>惠孟臣：</strong>以制作小壶闻名，孟臣壶成为功夫茶道标配�?/li>
</ul>

<h2>文人参与：清代中�?/h2>
<p><strong>陈曼�?/strong>设计了曼生十八式，将书法、篆刻与紫砂壶完美结合，开创了文人壶的先河�?strong>瞿子�?/strong>擅长在壶上刻竹。字随壶传、壶随字贵的传统由此形成�?/p>

<h2>近代复兴</h2>
<ul>
  <li><strong>顾景舟：</strong>紫砂泰斗，近代紫砂艺术的集大成者�?/li>
  <li><strong>七大老艺人：</strong>任淦庭、吴云根、裴石民、王寅春、朱可心、顾景舟、蒋蓉，奠定了现代紫砂工艺体系�?/li>
</ul>

<h2>当代传承</h2>
<p>如今宜兴紫砂被列入国家级非遗。从丁蜀镇的千年窑火到走向世界的华人茶席，紫砂壶的故事仍在继续�?/p>`,
    content_zhTW: `<h2>起源：明代正德年�?/h2>
<p>紫砂壺的歷史可追溯到明代正德年間�?506-1521年）。供春被譽為紫砂壺始祖，他製作的供春壺以樹癭為造型靈感，開創了紫砂壺仿生造型的先河�?/p>

<h2>興盛：明末清�?/h2>
<ul>
  <li><strong>時大彬：</strong>紫砂史上最具影響力的大師之一，首創了調砂技法�?/li>
  <li><strong>陳鳴遠：</strong>擅長花器，將自然界的瓜果、竹木元素融入紫砂創作�?/li>
  <li><strong>惠孟臣：</strong>以製作小壺聞名，孟臣壺成為功夫茶道標配�?/li>
</ul>

<h2>文人參與：清代中�?/h2>
<p><strong>陳曼�?/strong>設計了曼生十八式，將書法、篆刻與紫砂壺完美結合，開創了文人壺的先河�?strong>瞿子�?/strong>擅長在壺上刻竹。字隨壺傳、壺隨字貴的傳統由此形成�?/p>

<h2>近代復興</h2>
<ul>
  <li><strong>顧景舟：</strong>紫砂泰斗，近代紫砂藝術的集大成者�?/li>
  <li><strong>七大老藝人：</strong>任淦庭、吳雲根、裴石民、王寅春、朱可心、顧景舟、蔣蓉，奠定了現代紫砂工藝體系�?/li>
</ul>

<h2>當代傳承</h2>
<p>如今宜興紫砂被列入國家級非遺。從丁蜀鎮的千年窯火到走向世界的華人茶席，紫砂壺的故事仍在繼續�?/p>`,
    category: "culture",
    image: "/images/blog/zisha-history.jpg",
    createdAt: "2026-06-12",
    tags: ["宜兴紫砂历史", "紫砂壶文�?, "yixing history", "zisha heritage"],
  },
  {
    slug: "classic-zisha-teapot-shapes",
    title_zhCN: "紫砂壶经典壶型大全：西施、石瓢、仿古等",
    title_zhTW: "紫砂壺經典壺型大全：西施、石瓢、仿古等",
    excerpt_zhCN: "紫砂壶历经数百年发展，形成了数十种经典壶型。从西施到石瓢，从仿古到供春，每个壶型都有自己的故事�?,
    excerpt_zhTW: "紫砂壺歷經數百年發展，形成了數十種經典壺型。從西施到石瓢，從仿古到供春，每個壺型都有自己的故事�?,
    content_zhCN: `<h2>石瓢�?/h2>
<p>石瓢壶源自清代，是紫砂壶中最经典的款式之一。三角形结构，上窄下宽，重心沉稳。壶身呈梯形，壶嘴直流，出水爽利�?/p>
<ul>
  <li><strong>特点�?/strong>稳重大气、出水有力、断水干净</li>
  <li><strong>适合茶类�?/strong>几乎所有茶类，尤其乌龙茶和普洱</li>
  <li><strong>容量�?/strong>180-250ml最为常�?/li>
</ul>

<h2>西施�?/h2>
<p>西施壶原名西施乳，因形似美女西施的乳房而得名。壶身圆润饱满，倒把设计，壶盖采用截盖式�?/p>
<ul>
  <li><strong>特点�?/strong>圆润可爱、线条柔美、手感舒�?/li>
  <li><strong>适合茶类�?/strong>乌龙茶、红茶、普洱熟�?/li>
  <li><strong>注意�?/strong>壶把偏小，手大的人需试握</li>
</ul>

<h2>仿古�?/h2>
<p>仿古壶是清代邵大亨创制的经典款式，造型敦实厚重，线条简洁流畅。身筒呈鼓形，盖沿与口沿子母线吻合�?/p>
<ul>
  <li><strong>特点�?/strong>线条流畅、容量适中、实用性强</li>
  <li><strong>适合茶类�?/strong>各类茶均可，是日常泡茶首�?/li>
  <li><strong>容量�?/strong>200-300ml</li>
</ul>

<h2>供春�?/h2>
<p>供春壶是紫砂壶始祖供春所创，以银杏树瘿为造型灵感。壶身表面凹凸不平，模仿树皮的肌理，是紫砂花器的鼻祖�?/p>

<h2>其他经典壶型</h2>
<ul>
  <li><strong>容天壶：</strong>大肚能容，适合泡普洱、黑�?/li>
  <li><strong>秦权壶：</strong>仿秦代秤砣造型，气势庄�?/li>
  <li><strong>汉铎壶：</strong>仿汉代乐器铎造型，线条刚�?/li>
  <li><strong>井栏壶：</strong>仿古井栏杆造型，曼生十八式之一</li>
  <li><strong>掇球壶：</strong>三个球体叠合，比例和�?/li>
</ul>

<h2>选择建议</h2>
<p>新手建议从石瓢或仿古壶入手，实用性强，容错率高。进阶后可收藏西施、供春等更具审美意趣的壶型�?/p>`,
    content_zhTW: `<h2>石瓢�?/h2>
<p>石瓢壺源自清代，是紫砂壺中最經典的款式之一。三角形結構，上窄下寬，重心沉穩。壺身呈梯形，壺嘴直流，出水爽利�?/p>
<ul>
  <li><strong>特點�?/strong>穩重大氣、出水有力、斷水乾�?/li>
  <li><strong>適合茶類�?/strong>幾乎所有茶類，尤其烏龍茶和普洱</li>
  <li><strong>容量�?/strong>180-250ml最為常�?/li>
</ul>

<h2>西施�?/h2>
<p>西施壺原名西施乳，因形似美女西施的乳房而得名。壺身圓潤飽滿，倒把設計，壺蓋採用截蓋式�?/p>
<ul>
  <li><strong>特點�?/strong>圓潤可愛、線條柔美、手感舒�?/li>
  <li><strong>適合茶類�?/strong>烏龍茶、紅茶、普洱熟�?/li>
  <li><strong>注意�?/strong>壺把偏小，手大的人需試握</li>
</ul>

<h2>仿古�?/h2>
<p>仿古壺是清代邵大亨創製的經典款式，造型敦實厚重，線條簡潔流暢。身筒呈鼓形，蓋沿與口沿子母線吻合�?/p>
<ul>
  <li><strong>特點�?/strong>線條流暢、容量適中、實用性強</li>
  <li><strong>適合茶類�?/strong>各類茶均可，是日常泡茶首�?/li>
  <li><strong>容量�?/strong>200-300ml</li>
</ul>

<h2>供春�?/h2>
<p>供春壺是紫砂壺始祖供春所創，以銀杏樹癭為造型靈感。壺身表面凹凸不平，模仿樹皮的肌理，是紫砂花器的鼻祖�?/p>

<h2>其他經典壺型</h2>
<ul>
  <li><strong>容天壺：</strong>大肚能容，適合泡普洱、黑�?/li>
  <li><strong>秦權壺：</strong>仿秦代秤砣造型，氣勢莊�?/li>
  <li><strong>漢鐸壺：</strong>仿漢代樂器鐸造型，線條剛�?/li>
  <li><strong>井欄壺：</strong>仿古井欄杆造型，曼生十八式之一</li>
  <li><strong>掇球壺：</strong>三個球體疊合，比例和諧</li>
</ul>

<h2>選擇建議</h2>
<p>新手建議從石瓢或仿古壺入手，實用性強，容錯率高。進階後可收藏西施、供春等更具審美意趣的壺型�?/p>`,
    category: "knowledge",
    image: "/images/blog/classic-shapes.jpg",
    createdAt: "2026-06-12",
    tags: ["紫砂壶壶�?, "西施�?, "石瓢�?, "classic zisha shapes"],
  },
  {
    slug: "buy-yixing-teapot-overseas-guide",
    title_zhCN: "海外华人购买紫砂壶指南：如何识别正品",
    title_zhTW: "海外華人購買紫砂壺指南：如何識別正品",
    excerpt_zhCN: "身在海外想买一把正宗的宜兴紫砂壶，但担心买到假货？本文教你如何识别正品紫砂壶，安全放心地购买�?,
    excerpt_zhTW: "身在海外想買一把正宗的宜興紫砂壺，但擔心買到假貨？本文教你如何識別正品紫砂壺，安全放心地購買�?,
    content_zhCN: `<h2>海外购买紫砂壶的挑战</h2>
<p>对于海外华人来说，购买紫砂壶面临几个难题：信息不对称、无法实物查看、退换货麻烦、仿冒品泛滥。但只要掌握方法，依然可以买到正宗的宜兴紫砂壶�?/p>

<h2>如何识别正品紫砂�?/h2>

<h3>1. 看泥料质�?/h3>
<p>正宗宜兴紫砂泥料，表面有细微的砂粒感（颗粒感），用手触摸能感受到。颜色温润自然，不刺眼�?/p>
<ul>
  <li><strong>正品�?/strong>表面有砂粒感，颜色温润，有自然色�?/li>
  <li><strong>化工壶：</strong>表面过于光滑细腻，颜色鲜艳刺眼，价格极低</li>
</ul>

<h3>2. 看做工细�?/h3>
<ul>
  <li>壶盖与壶口紧密贴合，旋转平稳</li>
  <li>壶嘴出水流畅，断水干净</li>
  <li>壶内壁有明显的手工痕迹（全手工）或规整的模具线（半手工）</li>
  <li>壶底印章清晰工整</li>
</ul>

<h3>3. 看价�?/h3>
<ul>
  <li><strong>500元以下：</strong>基本可以确定是灌浆壶或注浆壶，非正宗紫砂</li>
  <li><strong>500-2000元：</strong>可买到入门级半手工壶，需仔细选择</li>
  <li><strong>2000元以上：</strong>可买到全手工壶或名家作品</li>
</ul>

<h2>推荐购买渠道</h2>
<h3>1. 信誉好的宜兴本地商家（可直邮海外�?/h3>
<p>直接联系宜兴本地紫砂商家，通过微信或官网选购，要求提供实物照片和泥料证明。选择支持国际邮寄的商家�?/p>

<h3>2. 海外华人茶具专营�?/h3>
<p>一些海外华人经营的茶具店，会直接从宜兴进货，对品质有把关�?/p>

<h3>3. 独立紫砂电商平台</h3>
<p>选择专注紫砂壶的独立跨境电商，如我们的紫砂雅集（zisha.hu），所有商品均为手工制作，提供详细泥料和工艺介绍�?/p>

<h2>购买注意事项</h2>
<ul>
  <li>要求商家提供多角度高清实物照�?/li>
  <li>询问泥料来源和烧制温�?/li>
  <li>了解退换货政策和国际运�?/li>
  <li>保留购买凭证和聊天记�?/li>
  <li>考虑关税和海关清关问�?/li>
</ul>

<h2>正品紫砂壶的其他特征</h2>
<p>真正的紫砂壶泡茶后，壶身会随着时间逐渐形成包浆，越来越温润。化工壶则不会有这种变化。一把好的紫砂壶，是越用越有味道的�?/p>`,
    content_zhTW: `<h2>海外購買紫砂壺的挑戰</h2>
<p>對於海外華人來說，購買紫砂壺面臨幾個難題：資訊不對稱、無法實物查看、退換貨麻煩、仿冒品氾濫。但只要掌握方法，依然可以買到正宗的宜興紫砂壺�?/p>

<h2>如何識別正品紫砂�?/h2>

<h3>1. 看泥料質�?/h3>
<p>正宗宜興紫砂泥料，表面有細微的砂粒感（顆粒感），用手觸摸能感受到。顏色溫潤自然，不刺眼�?/p>
<ul>
  <li><strong>正品�?/strong>表面有砂粒感，顏色溫潤，有自然色�?/li>
  <li><strong>化工壺：</strong>表面過於光滑細膩，顏色鮮豔刺眼，價格極低</li>
</ul>

<h3>2. 看做工細節</h3>
<ul>
  <li>壺蓋與壺口緊密貼合，旋轉平穩</li>
  <li>壺嘴出水流暢，斷水乾�?/li>
  <li>壺內壁有明顯的手工痕跡（全手工）或規整的模具線（半手工）</li>
  <li>壺底印章清晰工整</li>
</ul>

<h3>3. 看價�?/h3>
<ul>
  <li><strong>500元以下：</strong>基本可以確定是灌漿壺或注漿壺，非正宗紫砂</li>
  <li><strong>500-2000元：</strong>可買到入門級半手工壺，需仔細選擇</li>
  <li><strong>2000元以上：</strong>可買到全手工壺或名家作品</li>
</ul>

<h2>推薦購買渠道</h2>
<h3>1. 信譽好的宜興本地商家（可直郵海外�?/h3>
<p>直接聯繫宜興本地紫砂商家，通過微信或官網選購，要求提供實物照片和泥料證明。選擇支持國際郵寄的商家�?/p>

<h3>2. 海外華人茶具專營�?/h3>
<p>一些海外華人經營的茶具店，會直接從宜興進貨，對品質有把關�?/p>

<h3>3. 獨立紫砂電商平台</h3>
<p>選擇專注紫砂壺的獨立跨境電商，如我們的紫砂雅集（zisha.hu），所有商品均為手工製作，提供詳細泥料和工藝介紹�?/p>

<h2>購買注意事項</h2>
<ul>
  <li>要求商家提供多角度高清實物照�?/li>
  <li>詢問泥料來源和燒製溫�?/li>
  <li>了解退換貨政策和國際運�?/li>
  <li>保留購買憑證和聊天記�?/li>
  <li>考慮關稅和海關清關問�?/li>
</ul>`,
    category: "knowledge",
    image: "/images/blog/buy-overseas.jpg",
    createdAt: "2026-06-12",
    tags: ["海外购买紫砂�?, "正品识别", "buy yixing teapot", "authenticate zisha"],
  },
  {
    slug: "zisha-teapot-collection-guide",
    title_zhCN: "紫砂壶的升值空间：收藏级紫砂壶入门",
    title_zhTW: "紫砂壺的升值空間：收藏級紫砂壺入門",
    excerpt_zhCN: "紫砂壶不仅是一种实用茶具，更是一种可以升值的收藏品。了解收藏级紫砂壶的要素，开启你的紫砂收藏之旅�?,
    excerpt_zhTW: "紫砂壺不僅是一種實用茶具，更是一種可以升值的收藏品。了解收藏級紫砂壺的要素，開啟你的紫砂收藏之旅�?,
    content_zhCN: `<h2>紫砂壶的收藏价�?/h2>
<p>近年来，紫砂壶收藏市场持续升温。名家作品在拍卖会上屡创高价，例如顾景舟的紫砂壶曾拍出近亿元的天价。但收藏紫砂壶不一定需要天价，了解核心要素才能做出明智的选择�?/p>

<h2>决定紫砂壶收藏价值的五大要素</h2>

<h3>1. 作�?/h3>
<p>作者是决定紫砂壶价值的首要因素�?/p>
<ul>
  <li><strong>大师级：</strong>顾景舟、蒋蓉等已故大师作品，价值最�?/li>
  <li><strong>高工级：</strong>国家级高级工艺美术师，作品有稳定升值空�?/li>
  <li><strong>工艺师级�?/strong>中级职称工艺师，性价比较�?/li>
  <li><strong>潜力股：</strong>年轻有才华的艺人，未来可�?/li>
</ul>

<h3>2. 泥料</h3>
<p>原矿泥料是紫砂壶价值的基础。稀缺泥料如天青泥、大红袍泥等更具收藏价值�?/p>

<h3>3. 工艺</h3>
<p>全手工壶价值高于半手工壶。看壶的做工细节：嘴把比例、线条流畅度、明针功夫（壶面抛光）等�?/p>

<h3>4. 造型</h3>
<p>经典壶型（石瓢、西施、仿古等）市场认可度高，流通性好。原创设计壶型若设计出色，也有很大升值潜力�?/p>

<h3>5. 人文价�?/h3>
<p>有名人题刻、参与创作的壶（如曼生壶风格）价值更高。获奖作品、出版著录过的壶也具有额外价值�?/p>

<h2>收藏入门建议</h2>
<ol>
  <li><strong>从实用器开始：</strong>先买一把全手工实用壶感受紫砂之�?/li>
  <li><strong>建立人脉�?/strong>多与宜兴本地艺人、藏家交�?/li>
  <li><strong>关注新人�?/strong>关注年轻有潜力工艺师的作�?/li>
  <li><strong>专题收藏�?/strong>选择某一泥料、壶型或作者系列进行专题收�?/li>
  <li><strong>先学后买�?/strong>多看、多学、多请教，不要急于出手</li>
</ol>

<h2>收藏注意事项</h2>
<ul>
  <li>要求提供作者亲笔证书和作品合影</li>
  <li>了解作者职称、获奖经�?/li>
  <li>保存好购买凭证和包装</li>
  <li>注意保养，好的包浆会提升价�?/li>
  <li>警惕假证书、假职称、代工壶</li>
</ul>`,
    content_zhTW: `<h2>紫砂壺的收藏價�?/h2>
<p>近年來，紫砂壺收藏市場持續升溫。名家作品在拍賣會上屢創高價，例如顧景舟的紫砂壺曾拍出近億元的天價。但收藏紫砂壺不一定需要天價，了解核心要素才能做出明智的選擇�?/p>

<h2>決定紫砂壺收藏價值的五大要素</h2>

<h3>1. 作�?/h3>
<p>作者是決定紫砂壺價值的首要因素�?/p>
<ul>
  <li><strong>大師級：</strong>顧景舟、蔣蓉等已故大師作品，價值最�?/li>
  <li><strong>高工級：</strong>國家級高級工藝美術師，作品有穩定升值空�?/li>
  <li><strong>工藝師級�?/strong>中級職稱工藝師，性價比較�?/li>
  <li><strong>潛力股：</strong>年輕有才華的藝人，未來可�?/li>
</ul>

<h3>2. 泥料</h3>
<p>原礦泥料是紫砂壺價值的基礎。稀缺泥料如天青泥、大紅袍泥等更具收藏價值�?/p>

<h3>3. 工藝</h3>
<p>全手工壺價值高於半手工壺。看壺的做工細節：嘴把比例、線條流暢度、明針功夫（壺面拋光）等�?/p>

<h3>4. 造型</h3>
<p>經典壺型（石瓢、西施、仿古等）市場認可度高，流通性好。原創設計壺型若設計出色，也有很大升值潛力�?/p>

<h3>5. 人文價�?/h3>
<p>有名人題刻、參與創作的壺（如曼生壺風格）價值更高。獲獎作品、出版著錄過的壺也具有額外價值�?/p>

<h2>收藏入門建議</h2>
<ol>
  <li><strong>從實用器開始�?/strong>先買一把全手工實用壺感受紫砂之�?/li>
  <li><strong>建立人脈�?/strong>多與宜興本地藝人、藏家交�?/li>
  <li><strong>關注新人�?/strong>關注年輕有潛力工藝師的作�?/li>
  <li><strong>專題收藏�?/strong>選擇某一泥料、壺型或作者系列進行專題收藏</li>
  <li><strong>先學後買�?/strong>多看、多學、多請教，不要急於出手</li>
</ol>

<h2>收藏注意事項</h2>
<ul>
  <li>要求提供作者親筆證書和作品合影</li>
  <li>了解作者職稱、獲獎經�?/li>
  <li>保存好購買憑證和包裝</li>
  <li>注意保養，好的包漿會提升價�?/li>
  <li>警惕假證書、假職稱、代工壺</li>
</ul>`,
    category: "culture",
    image: "/images/blog/collection-guide.jpg",
    createdAt: "2026-06-12",
    tags: ["紫砂壶收�?, "紫砂壶升�?, "zisha collection", "teapot investment"],
  }
 ];
 
 export function getBlogPostBySlug(slug: string): BlogPost | undefined {
   return blogPosts.find((p) => p.slug === slug);
 }
 
 export function getBlogPostsByCategory(category: string): BlogPost[] {
   return blogPosts.filter((p) => p.category === category);
 }
