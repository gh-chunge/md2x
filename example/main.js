document.createElement('math');
document.createElement('annotation');

ty.set({
    suffix:     '.js',
    // 兼容 Require
    paths: {
        'marked':       'https://libs.cdnjs.net/marked/1.1.0/marked.min.js',
        'prism':        'https://libs.cdnjs.net/prism/9000.0.1/prism.min.js',
        'katex':        'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js',
        'raphael':      'https://libs.cdnjs.net/raphael/2.3.0/raphael.min.js',
        'flowchart':    'https://libs.cdnjs.net/flowchart/1.13.0/flowchart.min.js',
        'md2x':         'https://chun.ge/js/md2x.js',
        'mermaid':      'https://libs.cdnjs.net/mermaid/8.5.2/mermaid.min.js',
        'echarts':      'https://cdn.jsdelivr.net/npm/vditor@3.2.12/dist/js/echarts/echarts.min.js'
        // 多链接备用
    },
    // 传入到模块文件中的参数
});


var a = require(
    'prism, katex, md2x, mermaid, echarts'//
, function() {
    var tex, math, maths, v,
        article = document.getElementById('article'),
        nav = document.getElementById('nav'),
        txt = article.innerHTML, cfg = {
            noimg: 'https://www.zybuluo.com/static/img/logo.png'
        };
    var md = new ty.md2x(cfg);

    v = md.html(txt);

    article.innerHTML = v;

    maths = article.getElementsByTagName('math');
    for(var i=0; i<maths.length; i++) {
        var node = document.createElement('annotation');
        math = maths[i],
        tex  = math.innerHTML,
        node.innerHTML = tex;
        node.setAttribute('encoding', 'application/x-tex');
        katex.render(tex, math, {
            displayMode: (math.className=='') ? false : true,
            output: 'html',
        });
        math.appendChild(node);
    }

    var charts = document.getElementsByClassName('chart');

    // 绘制图表
    for(var i=0; i<charts.length; i++) {
        var opts = charts[i].innerHTML
        echarts.init(charts[i]).setOption(JSON.parse(opts));
    }
});

window.onload = function () {
    a();
};