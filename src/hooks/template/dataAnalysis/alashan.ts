export const stationTemplate = (
    date: string,
    summary_time: string,
    _delivery_time?: string,
    cap_req?: string
) => [
    {
          title: "阿拉善项目基本信息介绍",
        sn: "1",
content: `
        <table class="info-table" align="center" border cellspacing="0" cellpadding="0">
            <tr align="center">
            <td>场站名称</td><td>阿拉善项目</td><td>评估时间</td><td>${date}</td>
            </tr>
            <tr align="center">
            <td>场站地址</td><td colspan="3">阿拉善县新兴镇金昌园</td>
            </tr>
         <tr align="center">
            <td>产品分类</td><td>209 102 0.5C</td><td>项目号</td><td>CNF23A0</td>
   </tr>
            <tr align="center">
          <td>所在大洲</td><td>亚洲</td><td>所在国家</td><td>中国</td>
 </tr>
            <tr align="center">
          <td>集装箱数量</td><td>16</td><td>电池簇数量</td><td>10+1（1套）<br/>9+1（15套）</td>
            </tr>
         <tr align="center">
            <td>额定总功率</td><td>25MW</td><td>交流功率</td><td>10+1:1707.8kw<br/>9+1:1537kw</td>
            </tr>
            <tr align="center">
            <td>整体标称容量</td><td>50MWh</td><td>电池系统容量</td><td>10簇:3.541MWh<br/>9簇:3.186MWh</td>
            </tr>
            <tr align="center">
            <td>电池额定容量</td><td>133Ah</td><td>电池簇电压</td><td>1081.6V-1497.6V</td>
        </tr>
            <tr align="center">
          <td>电池电压极限范围</td><td>2.5V - 3.85V</td><td>电池电压推荐范围</td><td>2.5V - 3.65V</td>
          </tr>
          <tr align="center">
            <td>数据范围</td><td>${summary_time}</td><td>电池型号</td><td>102 0.5C</td>
            </tr>
            <tr align="center">
            <td>质保要求</td><td>${cap_req ?? ""}</td><td>制冷方式</td><td>液冷</td>
            </tr>
        </table>`,
    },
      {
        title: "阿拉善项目地点位置介绍",
        sn: "2",
    },
  {
        title: "阿拉善项目当地气候",
        sn: "3",
 content: `<p></p>海南乐东当地气候特征：
 <p>屯昌位于海南省中部，属于热带季风气候区。其气候特征如下： </p>
                 <p>四季变化不大，长夏无冬，高温多雨； </p>
                <p>干湿季分明，日照时间长，年日照时数在1900至2100小时之间；</p>
                                <p>雨水充沛，年降水量在1960至2400毫米之间；</p>
                <p>年平均气温介于16℃到36℃之间，环境对产品影响不大。</p>
                `,
    },
];
