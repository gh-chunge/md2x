// +------------------------------------------------------------------------------------------------
// [ md2x.js ] 
// +------------------------------------------------------------------------------------------------
// | Version	初版
// | By			春哥 <dev@chun.ge>
// | Update		2020/11/25
// +------------------------------------------------------------------------------------------------
// 
"use strict";
(function(w, factory) {
	// 导出相关的函数和类到全局/模块
	// 检查环境
	if("function"==typeof define) {
		// 
		define(factory);
	} else {
		w.md = factory;
	}
})(this, function() {
	var cfg = {
		toc: true, 				// 强制开启目录{true|false}
		debug: false,			// 测试{true|false}
		warn: false,			// 警告{true|false}
		lazy: false,			// 懒渲染{true|flase}
		langPreFix: 'lang-',	// <pre class="lang-c"></pre>
		noimg: '',
		nodes: {}
	}, root = [
		'toc', 'note', 'id', 'h1', 
		'h',
		'pre', 'hr',
		'link', 'link_id', 'id', 'img', 'img_id',
		'excerpt', 'tip', 'quote', 'ol', 'ul',
		'math', 'echarts',
	], rows = {}, escapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	}, rule = {}, render = {}, spec = {}, all = {}, MD = function(c, t=null) {

		this.info  = {
			v: '1.0',		// 当前版本
			t: '20200518',	// 最后修订时间
		}
		this.t = t
		this.p = 1

		this.c = set(c);

		this.c.nodes.push('end', 'txt');
	};

	var Parse = function(t, root) {
		this.init = false;
		this.t = t 				// 剩余文本内容
		this.root = root

		this.r = []
		this.note = {}
		this.h = []
		this.id = {};

		this.g = []

		return this.run();
	};

	// 获取属性值
	Parse.prototype.get = function(n) { return this[n]||false;}

	Parse.prototype.m = function(a, r) {
		if(typeof r == 'string') {
			r = rows[r];
		}
		a.txt = a.txt.trim();

		var m, rst={};
		for(var n in r) {
			n = r[n];
			m = rule.block[n][0].exec(a.txt);
			if(!m) continue;
			for(var i=1;i<m.length&&i<rule.block[n].length;i++) {
				rst[rule.block[n][i]] = m[i];
			}
			rst.d = a.d + 1;
			rst.n = n;
			break;
		}
		return rst;
	}

	// 保留指定项数 this.g
	Parse.prototype.close = function(d) {
		if(d<0) d=0;
		var k;
		while(this.g.length-d) {
			k = this.g.pop();
			// 关闭时检查是否是中间级
			if(typeof rows[k] == 'string') {
				this.r.push({
					type:	'end',
					n:		rows[k]
				});
			}
			this.r.push({
				type:	'end',
				n:		k
			});
		}
	}

	Parse.prototype.run = function() {
		// 已解析
		if(this.init) return this;

		var m, arr;
		while(this.t) {
			for(var n in this.root) {
				n = this.root[n];
				m = rule.block[n][0].exec(this.t);
				
				if(!m) continue;

				this.t = this.t.substring(m[0].length);

				arr = {};

				// 对正则匹配的变量进行命名
				for(var i=1;i<m.length&&i<rule.block[n].length;i++) {
					if(rule.block[n][i]=='d') {
						arr.d = m[i].length + 1;// 使用空格：parseInt(/4)
					} else {
						arr[rule.block[n][i]] = m[i];
					}
				}

				m = null;

				// 含有特例，重新确定类型
				// pre 中
				if(n in spec && spec[n].indexOf(arr.desc)>0) {
					n = arr.desc;
				}

				// 无等级
				if(!arr.d) {
					arr.type = n;
					// 关闭所有开始项
					this.close(0);
					
					// 元素的相应处理
					switch(n) {
						case 'note':
							this.note[arr.id] = arr.txt;
							break;
						case 'toc':
							break;
						case 'h':
							arr.lv = arr.lv.length;
							this.r.push(arr);
							this.h.push(arr);
							break;
						case 'id':
							this.id[arr.id] = arr;
							break;
						case 'h1':
							this.h1 = arr;
							break;
						case 'pre':
							arr.txt		= arr.txt.replace(/\\`\\?`\\?`/g, '```')
							arr.lang	= arr.desc
							break;
						case 'h':
							arr.lv--;
							break;
						case 'img':
							//console.log(arr)
							break;
						case 'img_id':
							//console.log(arr)
							break;
						case 'link':var q;
							// 检查链中图片
							if(q = rule.block['img'][0].exec(arr.txt)) {
								//console.log('链接中存在图片1')
								//console.log(q)
								//arr.img_txt = 
							} else if(rule.block['img_id'][0].exec(arr.txt)) {
								//console.log('链接中存在图片2')
							}
							
							arr.txt		= arr.txt||arr.href;
							arr.title	= arr.title||'';
							//console.log(arr)
							break;
						case 'link_id':
							arr.txt		= arr.txt||arr.href;
							arr.title	= arr.title||'';
							//console.log(arr)
							break;
						default:
							//
					}
					/*if(n in fn) {
						//fn[n](r, p, m);
					}*/

					// 普通项：到序列
					if(!(n in all)) {
						this.r.push(arr);
					}
					// 跳出for循环
					break;
				}

				arr.n = n;

				while(1) {
					// 深度小 >>> 级别大
					// 存在平级项
					if(arr.n==this.g[arr.d-1]) {
						// 存在平级项 and 同型
						// 同型
						if(typeof rows[arr.n]=='string') {
							// 不合并
							this.close(arr.d); // 关闭至下一级
							
							// 关闭再新建中间级
							this.r.push({
								type:	'end',
								n:		rows[arr.n]
							}), this.r.push({
								type:	'start',
								n:		rows[arr.n]
							});
						}
						// 对内容深入解析，允许下级中选择
						arr = this.m(arr, rows[arr.n]);
						// 下一次while循环
						continue; 
					} else if(arr.d<=this.g.length) {
						// 存在平级项 and 不同型
						this.close(arr.d); // 关闭至下一级
						
						// 添加 txt
						if(arr.n=='txt') {
							
							this.r.push({
								type:	'txt',
								txt:	arr.txt
							});
							break;
						}

						// 关闭至平级 and 作为下级检查
						this.close(arr.d-1);
						continue;
					}

					// 小
					// 允许下级
					if(arr.n=='txt') {
						arr.type = arr.n,
						delete arr.n,
						this.r.push(arr);
						break;
					}

					var s;
					// 确定允许的下级
					if(this.g.length==0) {
						s = this.root;
					} else if(typeof rows[this.g[this.g.length-1]] == 'string') {
						s = rows[rows[this.g[this.g.length-1]]];
					} else {
						s = rows[arr.n];
					}

					// 非允许下级
					if(s.indexOf(arr.n)<0) {
						// 提升arr.d，强行平级，作同级检查
						arr.d = this.g.length;
						continue;
					}

					// 非 txt
					this.g.push(arr.n),
					this.r.push({
						type:	'start',
						n:		arr.n
					});

					// 判断中间级
					if(typeof rows[arr.n] == 'string') {
						this.r.push({
							type:	'start',
							n:		rows[arr.n]
						});
					}

					// 再深入解析
					arr = this.m(arr, rows[arr.n]);
				}

				// 跳出for循环
	        	break;
			}
		}

		this.init = true;

		return this;
	};

	// 特殊节点
	all.toc = function(){},
	all.h	= function(){},
	all.id	= function(){},
	all.end	= function(){},

	// 特例
	spec.pre	= ['math', 'gantt', 'mind', 'seq', 'flow', 'graph', 'chart', 'pie', 'echarts'],

	// 可内嵌
	rows.ul		= 'li',
	rows.ol		= 'li',
	rows.li		= ['txt', 'ul', 'ol', 'quote'],
	rows.quote	= ['txt', 'ul', 'ol', 'quote'],
	
	// 正则表达式
	rule.block = {
		toc:	[/^\[toc\](?:\n|$)/i],
		h1:		[/^#(?!#) *(.*) *#? *(?:\n|$)/, 'txt'],
		h:		[/^(#{2,6}) *(.*?)(?: +#+)? *(?:\n|$)/, 'lv', 'txt'],
		excerpt:[/^&gt; +excerpt *\n((?:.+\n)+) *(?:\n|$)/, 'txt'],
		table:	[/^(?:[:：] *(.+)\n={3,}\n)?(?:\|?(?:.*?\|)+.*?\|?\n(?: *[-:]+[-| :]*)\n)(.*?\n)+?(?: *\n|={3,}|$)/],// table数据表
		echarts:[/^{ *\n([\s\S]*)\n} *(?:\n|$)/, 'txt'],
		dl:		[/^(.+)\n[:：] *(.+)(?:\n|$)/],
		hr:		[/^ *((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n|$)/],
		link:	[/^\[(.*)\]\(([--:=?-Z_a-z]+) *(".*")?\) *(?:\{(.*)\})? *(?:\n|$)/, 'txt', 'href', 'title', 'opts'],
		link_id:[/^\[(.*)\]\[(.+)\] *(?:\{(.*)\})? *(?:\n|$)/, 'txt', 'id', 'opts'],
		img:	[/^!\[(.+)\]\(([--:=?-Z_a-z]+) *(".*")?\) *(?:\{(.*)\})? *(?:\n|$)/, 'txt', 'src', 'opts'],
		img_id:	[/^!\[(.+)\]\[(.+)\] *(?:\{(.*)\})? *(?:\n|$)/, 'txt', 'id', 'opts'],
		tip:	[/^&gt; +(warn|info|danger|success) *\n((?:.+\n)+) *(?:\n|$)/, 'tip', 'txt'],
		quote:	[/^(\t*)(?:&gt;|>)(.*)(?:\n|$)/, 'd', 'txt'],
		ol:		[/^(\t*)([0-9a-zA-Z]+)([.)]) (.*)(?:\n|$)/, 'd', 's', 'tp', 'txt'],// 有序列表
		ul:		[/^(\t*)[*+-] (.*)(?:\n|$)/, 'd', 'txt'],// 无序列表
		pre:	[/^`{3} *([a-zA-Z-]*) *\n([\s\S]*?)\n? *`{3} *(?:\n+|$)/, 'desc', 'txt'],
		math:	[/^\$\$ *\n([\s\S]*?)\n\$\$ *(?:\n|$)/, 'txt'],
		id:		[/^\[([a-zA-Z0-9]*)\]\: *([--:=?-Z_a-z]+) *("(?:.*)"|'(?:.*)'|\((?:.*)\))? *(?:\{(.*)\})? *(?:\n|$)/, 'id', 'link', 'title', 'opts'],
		note:	[/^\[\^([a-zA-Z0-9]+)\]\: *(.+)(?:\n|$)/, 'id', 'txt'],
		txt:	[/^(\t*)(.*)(?:\n|$)/, 'd', 'txt'],
		end:	[/^\n+/],
	}, rule.inline = {
		//escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
		math:	/\$(.*?)\$/g,		// 行内公式
		b:		/\*\*(.*?)\*\*/g,	// 加粗
		i:		/__(.*?)__/g,		// 倾斜
		u:		/「(.*?)」/g,			// 下划线
		del:	/~~(.*?)~~/g,		// 删除线
		code:	/\`([^\$]*?)\`/g,	// 代码、数据
		txt:	/[^\\\$\`]*/g,
	}, rule.fn = {
		// 摘要
		// 关键字
		// dl定义列表
		dl: function(r, p, c) {
			r[p].push({
				type: 	'dl',
				key: 	c[1],
				txt: 	c[2],
			});
		},
		excerpt: function(r, p, c) {
			r[p].push({
				type: 	'excerpt',
				txt: 	c[1],
			});
		},
		tip: function(r, p, c) {
			r[p].push({
				type: 	'tip',
				lv: 	c[1],
				txt: 	c[2],
			});
		},
		txt: function(r, p, c) {
			r[p].push({
				type: 	'txt',
				txt: 	c[1]
			});
		},
	};
	
	// 渲染方法
	render.tags = {
		'quote':	['<blockquote class="">', '</blockquote>'],
		'ol':		['<ol class="">', '</ol>'],
		'ul':		['<ul class="">', '</ul>'],
		'li':		['<li class="">', '</li>'],
	}, render.html = {
		h1:		'<h1 class="t1">{{txt}}</h1>',
		h:		'<h{{lv}} class="t{{lv}}">{{txt}}</h{{lv}}>',
		dl:		'<dl><dt>{{key}}</dt><dd>{{txt}}</dd></dl>',// dl定义列表
		hr:		'<hr class="">',
		tip:	'<p class="tip {{tip}}">{{txt}}</p>',//n.txt.replace(/\n(?!$)/g, '<br/>')
		excerpt:'<p class="article-excerpt">{{txt}}</p>',//n.txt.replace(/\n(?!$)/g, '')// 摘要
		pre: 	'<pre class="code-wrap lang-{{desc}}">{{txt}}</pre>',
		math:	'<math class="block">{{txt}}</math>',
		echarts:'<div class="chart" style="width:600px;height:400px;">{ {{txt}} }</div>',// chart图、表
		txt:	'<p class="txt">{{txt}}</p>',
		link:	'<p><a href="{{href}}" title={{title}}>{{txt}}</a></p>',
		img:	'<figure class="{{pos}}"><img data-src="{{src}}" alt="{{txt}}"><figcaption>{{txt}}</figcaption></figure>',
		graph:	'<div class="mermaid {{type}}">{{txt}}</div>',
		seq:	'<div class="mermaid {{type}}">sequenceDiagram\n{{txt}}</div>',//sequence
		gantt:	'<div class="mermaid {{type}}">{{type}}\n{{txt}}</div>',
		pie:	'<div class="mermaid {{type}}">{{type}}\n{{txt}}</div>',
		link_id: function(n) {
			return '<p><a href="href" title={{title}}>参考式超链接</a></p>';
		},
		
		url: function(n) {return ''},
		// 开始 在标志节点中
		start: function(n) {
			return render.tags[n.n][0];
		},
		// 结束
		end: function(n) {
			return render.tags[n.n][1];
		},
		
		// 关键字
		// 目录
		// table数据表
		// todo选项列表
		todo: function(n) {return ''},
		note: function(n) {
			return ''
		},
	};

	function set(c) {
		if(typeof c=='undefined'||c==''||c==null) {
			c = cfg;
		} else {
			for(var n in cfg) {
				c[n] = (typeof c[n]=='undefined'||c[n]==''||c[n]==null) ? cfg.n : c[n];
			}
		}

		c.nodes = (typeof c.nodes=='undefined'||c.nodes==''||c.nodes==null) ? root : [];
		// 还要判断 节点是否正确
		for(n in c.nodes) {
			if(!(c.nodes[n] in rule.block)) {
				c.nodes.splice(n, 1);
			}
		}
		return c;
	}

	function parse_inline(md) {
		var //cap,
			//out = '',
			rules = rule.inline;// 有一些字段无加粗 code// 代码 // 数学公式//// emoji
		md = md.replace(rules.code, "<code>$1</code>")
				.replace(rules.math, "<math>$1</math>")
				.replace(rules.del, "<del>$1</del>")
				.replace(rules.u, "<u>$1</u>")
				.replace(rules.i, "<i>$1</i>")
				.replace(rules.b, "<strong>$1</strong>")
				//.replace(rules.emoji, "$1")
				//

		/*while (md) {
			// 转义字符
			if(cap = rules.escape.exec(md)) {console.log('escape')
				md = md.substring(cap[0].length);console.log(cap)
				out += cap[1];
				continue;
			}
		}*/
		return md
	}

	// 解析
	function parse(o, t=null) {
		if(t!==null) {
			o.t = t;
		} else if(o.t!=null) {
			t = o.t;
		} else {
			o.rst = [];
			return ;
		}

		// [v]处理换行、空格
		t = t.replace(/\r\n|\r/g, '\n')

		// 将 连续多个换行 转为 隔1行
		// 去除文本(开头|结尾)的换行
		// 去除文本(开头|结尾)的空格
		t = t.replace(/\n{3,}/, '\n\n')
			.replace(/(^\n+|\n+$)/, '')
			.replace(/(^\s+|\s+$)/, '')

		// 解析出节点
		var r = [{}, []];

		var txt = new Parse(t, o.c.nodes);

		r[1]		= txt.get('r');
		r[0].h		= txt.get('h');
		r[0].id 	= txt.get('id');
		r[0].note	= txt.get('note');

		o.r = r;
	}

	MD.prototype = {
		toc: function() {},
		html: function(t=null) {
			var htmls = [], str;
			
			parse(this, t);

			// 对主要内容进行渲染
			for(var n in this.r[1]) {
				n = this.r[1][n];
				if(n.type==='txt') {
					n.txt = parse_inline(n.txt);
				}
				if(typeof render.html[n.type] == 'string') {
					str = render.html[n.type];
					for(var k in n) {
				        str = str.replace(new RegExp('\{\{'+k+'\}\}', 'g'), n[k]);
				    }
				} else if(typeof render.html[n.type] == 'function') {
					// 函数//htmls[htmls.length] = 
					str = render.html[n.type](n);
				}

				// 
				htmls[htmls.length] = str;
			}

			// 渲染脚注 this.note
			htmls[htmls.length] = '<hr/><h3>注释内容</h3>';
			for(var n in this.r[0].note) {
				htmls[htmls.length] = '<p>'+n+'：'+this.r[0].note[n]+'</p>';
			}

			htmls = htmls.join('');

			return htmls;
		},
		pdf: function(t=null) {
			console.log('暂不支持将Markdown转换为PDF！');
		}
	};

	return MD;
});