document.createElement('math');
document.createElement('annotation');

ty.set({
    // 模块所在路径
    //（注意，如果是script单独引入layui.js，无需设定该参数。），一般情况下可以无视
    base:       'http://localhost:99/Tyui@0.1/js/libs/', // 扩展模块所在目录
    debug:      true,       // 开启调试模式，{false|true}
    suffix:     '.js',
    alias: {
        app: 'http://localhost:99/js/app/',
        ext: 'http://localhost:99/js/ext/',
        ven: 'http://localhost:99/vendor/',
    },
    // 兼容 Require
    paths: {
        //:'http://localhost:99/Tyui@0.1/js/units/md2html.js',
        'marked':       'ven:marked.js',
        'prism':        'ven:prism.js',
        'katex':        'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js',
        'raphael':      'https://libs.cdnjs.net/raphael/2.3.0/raphael.min.js',
        'flowchart':    'ven:flowchart-latest.js',
        'md2x':         '../md2x.js?v=1.0',
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