(function(){
	var oHide = document.getElementById('hide'),
	    oShow = document.getElementById('show'),
	    oChangeBg = document.getElementById('ChangeBg'),
	    oChangeCg = document.getElementById('ChangeCg'),
	    oBody = document.body,
	    oBox = document.getElementById('box');
	
	//隐藏、显示信息面板
	var flag = 0;
	oHide.onclick = function(){
		flag?oShow.style.display = 'block':oShow.style.display = 'none';
		flag++;
		flag = flag%2;
	}

	//更改场景
	var cj = 0;
	oChangeCg.onclick = function(){
		cj++;
		cj = cj%3;
		oBox.style.backgroundImage = 'url("./img/map_bg'+cj+'.png")';
	}

	//更改背景
	var bj = 1;
	oChangeBg.onclick = function(){
		bj++;
		bj = bj%4;
		oBody.style.backgroundImage = 'url("./img/bBg'+bj+'.jpg")';
	}

	//根据屏幕大小调节显示布局
	var si = 1095;
	function Boot(size){
		var WinW = document.documentElement.clientWidth || document.body.clientWidth,
			oMsg = document.getElementById('Msg'),
			oGameExp = document.getElementById('GameExp'),
			oSg = document.getElementById('sg');
		if(WinW<=size){
			oMsg.style.display = 'none';
			oGameExp.style.display = 'none';
			oSg.style.display = 'none';
		}else if(WinW>size){
			oMsg.style.display = 'block';
			oGameExp.style.display = 'block';
			oSg.style.display = 'block';
		}
	}
	Boot(si);
	//窗口调整大小时发生的事件
	window.onresize = function(){
		Boot(si);
	};

})();


(function(){
	var oBox = document.getElementById('box'),
		oSrc = ['./img/plane/plane_0.png','./img/plane/plane_1.png'],
		oMsg = document.getElementById('Msg'),
		oSg = document.getElementById('sg'),
		gP = oSg.getElementsByTagName('p'),
		oBody = document.body
		oP = oMsg.getElementsByTagName('p'),		
		pLength = oP.length,
		Full = 10,			//防空求助次数		
		ifEnd = false,		//游戏是否结束
		isProt = false,		//是否开保护罩
		BossInt = false,	//boss是否出现
		KillBoss = false,	//是否杀死boss
		killEmyNum = 0;		//统计杀死敌军的数量
	oBox.oncontextmenu = function(){return false};	//避免右击鼠标时触发并打开上下文菜单。
	oBody.oncontextmenu = function(){return false};
	window.requestAnimationFrame = window.requestAnimationFrame || function(a){return setTimeout(a, 1000/60)};
	window.cancelAnimationFrame = window.cancelAnimationFrame || function(a){return clearTimeout(a)};

	gameInte();
	//生成游戏初始界面
	function gameInte(){
		//选择飞机
		var index = 0;  //定义当前选择的是哪个飞机
		var oDiv = document.createElement('div'),
			oUl = document.createElement('ul'),
			oBody = document.body;						
		oDiv.id = 'open';
		oUl.id = 'choose';
		for(var i = 0; i < 2; i++){
			var oLi = document.createElement('li'),
				oImg = document.createElement('img');
			oImg.src = oSrc[i];
			oImg.width = 120;
			oImg.height = 120;
			oImg.index = i;  //代表选择的是哪个飞机
			oUl.appendChild(oLi);
			oLi.appendChild(oImg);
			oImg.onclick = function(){
				oBody.removeChild(oDiv);
				// console.log(index+"  "+this.index);
				index = this.index;
				//修改信息
				oP[0].innerHTML = "当前战斗机："+(index===0?'红莲战斗机':'瓜皮战斗机');
				gP[0].innerHTML = "欢迎来到小游戏!你选择了: "+(index===0?'红莲战斗机':'瓜皮战斗机');
			}
		}
		oDiv.appendChild(oUl);
		oBody.appendChild(oDiv);	
		//创建标题
		var Tit = document.createElement('h2');
		Tit.className = 'title';
		Tit.innerHTML = '飞机大战';
		oBox.appendChild(Tit);				
		//游戏关卡
		for(var i = 0; i < 4; i++){
			var oPP = document.createElement('p');
			oPP.index = i;
			switch(oPP.index){
				case 0:
					oPP.innerHTML = '入门';
					break;
				case 1:
					oPP.innerHTML = '普通';
					break;
				case 2:
					oPP.innerHTML = '困难';
					break;
				case 3:
					oPP.innerHTML = '极速乱斗(低配慎入)';
					oPP.className = 'ult';
					break;
			}
			oPP.onclick = function(eve){
				eve = eve || window.event;
				var Msg = {
					x : eve.clientX,//clientX 事件属性返回当事件被触发时鼠标指针向对于浏览器页面（或客户区）的水平坐标。
					y : eve.clientY
				}
				//Msg{}鼠标坐标
				// console.log("Msg:"+Msg);
                ifEnd = false;  //设置为未结束状态
                Full = 10; //重设导弹次数
                oP[1].innerHTML = '防空求助：剩余'+Full+'次';

				starGame(this.index, Msg, index);
			};
			oBox.appendChild(oPP);
		}
	}

	//开始游戏
	function starGame(index , Msg, choose){
		oBox.innerHTML = '';
		var Plane = new Image();
		Plane.src = oSrc[choose];  //根据选择的情况来改变飞机贴图
		Plane.width = 40;
		Plane.height = 60;
		Plane.className = 'plane';
		oBox.appendChild(Plane);
		var _x = oBox.offsetLeft + Plane.width/2,
			_y = oBox.offsetTop + Plane.height/2;
		Plane.style.left = Msg.x - _x + 'px';
		Plane.style.top = Msg.y - _y + 'px';
		document.onmousemove = function(eve){
			eve = eve || window.event;
			var _left = eve.clientX - _x,
				_top = eve.clientY - _y;
			//限定边界，不然超出游戏框
			var leftMin = -Plane.clientWidth/2,
				leftMax = oBox.clientWidth - Plane.clientWidth/2,
				topMin = -Plane.clientHeight/2 +15,
				topMax = oBox.clientHeight - Plane.clientHeight/2 - 15;
			_left = Math.min(_left, leftMax);//min() 方法可返回指定的数字中带有最低值的数字。
			_left = Math.max(_left, leftMin);
			_top = Math.min(_top, topMax);
			_top = Math.max(_top, topMin);
			Plane.style.left = _left + 'px';
			Plane.style.top = _top + 'px';
			oP[8].innerHTML = !ifEnd?'当前X坐标：' + (_left+20):'当前X坐标：0';
			oP[9].innerHTML = !ifEnd?'当前Y坐标：' + (_top+15):'当前Y坐标：0';
		};

		var bullSpeed = 300;
		var s1 = " ";
		switch(index){
			case 0:
				//bullSpeed=10;//测试时
				bullSpeed = 350;
				bossNum = 5;	//击杀20机出现boss
				s1 = "关卡说明: 只有2种敌机, 来体验一下吧!<br/>击杀"+bossNum+"个敌机会出现boss<br/>击杀boss需要打中15发子弹"
				break;
			case 1:
				//bullSpeed=10;//测试时
				bullSpeed = 450;
				bossNum = 20;	//击杀20机出现boss
				s1 = "关卡说明: 有8种敌机, 来体验一下吧!<br/>击杀"+bossNum+"个敌机会出现boss<br/>击杀boss需要打中30发子弹"
				break;
			case 2:
				//bullSpeed=10;//测试时
				bossNum = 40;	//击杀20机出现boss
				bullSpeed = 350;
				s1 = "关卡说明: 有16种敌机, 来体验一下吧!<br/>击杀"+bossNum+"个敌机会出现boss<br/>击杀boss需要打中150发子弹"
				break;
			case 3:
				//bullSpeed=10;//测试时
				bossNum = 100;	//击杀20机出现boss
				bullSpeed = 30;
				s1 = "关卡说明: 有16种敌机, 满屏的敌机, 来体验扫射吧!<br/>击杀"+bossNum+"个敌机会出现boss<br/>击杀boss需要打中1500发子弹"
				break;
		}
		oP[2].innerHTML =  "子弹生成速度："+bullSpeed+"ms/个";
		gP[1].innerHTML = s1;
		var num = 0,	//当前游戏框内的子弹数
			num2 = 0;	//已经发射的子弹数

		//生成子弹
		function bullLaunch(){
			var bull = new Image();
			bull.src = 'img/bull.png';
			bull.className = 'bull';
			bull.width = 5;
			bull.height = 30;
			bull.style.left = Plane.offsetLeft + Plane.clientWidth/2 - 2.5 + 'px';
			bull.style.top = Plane.offsetTop - 30 + 'px';
			oBox.appendChild(bull);
			num++;  //子弹+1
			num2++;  //已发射出去的子弹+1
			//移动子弹
			moveBull();
			function moveBull(){
				// console.log("父节点: "+bull.parentNode.id);
				if(bull.parentNode &&  bull.offsetTop <= -bull.clientHeight){
					oBox.removeChild(bull);
					num--; //子弹-1
					return;
				}
				bull.style.top = bull.offsetTop - 5 + 'px';
				bull.timer = requestAnimationFrame(moveBull);
			}
			oP[3].innerHTML = "当前子弹个数："+num+"颗";  //修改信息
			oP[4].innerHTML =  "已发射子弹数量："+num2+"颗";  //修改信息
		}
		//子弹发射效果
		Plane.timer = setInterval(bullLaunch, bullSpeed);

		
		function enemy(index){
			var speed = 300;
			var moveS = 3;
			// var typeE = 4 * (index+1);
			switch(index){
				case 0:
					Bblood = 150; //boss血量
					//speed = 50;//测试时 
					speed = 800;	//生成敌军速度
					moveS = 0.8;	//敌军移动
					width = 50;		//敌军宽 高
					height = 70;
					typeE = 2;		//敌军类型
					break;
				case 1:
					//speed = 50;//测试时
					Bblood = 150; 
					speed = 600;
					moveS = 1;
					width = 40;
					height = 55;
					typeE = 8;
					break;
				case 2:
					//speed = 50;//测试时 
					Bblood = 150;
					speed = 400;
					moveS = 2;
					width = 35;
					height = 55;
					typeE = 16;
					break;
				case 3:
					Bblood = 150;
					speed = 50;
					moveS = 4;
					width = 30;
					height = 50;
					typeE = 16;
					break;
			}
			//敌军个数
			var enemyNum = 0;
			//生成敌军
			function enemytimer(){
				var Img = new Image();
				Img.src = 'img/enemy/enemy'+(Math.floor(Math.random()*typeE+1))+'.png';
				Img.width = width;
				Img.height = height;
				Img.className = 'enemy';
				oBox.appendChild(Img);
				enemyNum++;   //敌军数量统计增加
				var oLeft = Math.random()*(oBox.clientWidth - Img.width/2);
				Img.style.left = oLeft + 'px';
				var ranS = Math.random()*moveS+1;	//从上到下的移动速度
				//移动或者超出时移去敌军
				enemyMove();
				function enemyMove(){
					Img.style.top = Img.offsetTop + ranS + 'px';
					//超出检测
					if(Img.offsetTop >= oBox.clientHeight){
						oBox.removeChild(Img);
	                    enemyNum--;
						return;
					}
					Img.timer = requestAnimationFrame(enemyMove);
					pz(Img , index);
				}
				oP[5].innerHTML = '当前敌军数量：'+enemyNum+'个';
			}
			//生成敌军
			var timer = setInterval(enemytimer, speed);

			var pzNum = 0; //统计已消灭的敌军
			function pz(Img, index){
				var oBull = oBox.querySelectorAll('.bull');
				//在文档内找全部符合选择器描述的节点包括Element本身
				var	oLength = oBull.length;
				//判断敌军和子弹
				for(var i = 0; i < oLength; i++){
					if(Img.parentNode&&oBull[i].parentNode&&collision(Img ,oBull[i])){
						cancelAnimationFrame(oBull[i].timer);
						cancelAnimationFrame(Img.timer);
                        enemyNum--;
						//创建敌军爆炸后的图片
						boomImg(oBox, 'img/boom.png', 30, 50, 'boom', Img);
						oBox.removeChild(oBull[i]);
						oBox.removeChild(Img);
						pzNum ++;
                        num --;
						killEmyNum++;
						oP[6].innerHTML = '已消灭敌军数量：'+killEmyNum+'个';
						oP[7].innerHTML = '当前分数：'+killEmyNum*1500+'分';

						//敌军爆炸音效
						BoomAud('music/enemyBoom.mp3',1000);

                        //生成Boss
                        if(pzNum >= bossNum&&!BossInt){
                            IntBoss();
                        }
					}
				}

				//生成Boss
				function IntBoss(){
					//停止小怪生成
                    clearInterval(timer);
                    //剩余部分
                    var Boss = document.createElement('div'),
                        name = ['left','main','right'],
                        width = [37,75,37],
                        BgM = document.getElementById('BgMusic'),
                        Boss_blood = Bblood,   //统计boss血条
                      //  Boss_damage = 0.05,  //默认boss所受伤害
                        BuSpe = 300;  //Boss发射子弹速度
                    BgM.src = 'music/boss_diff.mp3';
                    function bossMove(){
                        BgM.src = 'music/boss_bg1.mp3';
                        //让Boss移动
                    	move(Boss, {'left':'0'}, 3000,function(){
                    		move(Boss, {'left':'300'}, 3000,function(){
                    			move(Boss, {'left':'150'}, 1000,function(){
                    				move(Boss, {'top':'100'}, 500,function(){
                        				move(Boss, {'top':'0'}, 500,function(){
                        					move(Boss, {'top':'100','left':'100'}, 1500,function(){
                        						move(Boss, {'top':'200'}, 1500,function(){
                        							move(Boss, {'top':'0','left':'250'}, 3000,function(){
                        								move(Boss, {'top':'0','left':'150'}, 3000,function(){
                        									var timer = setInterval(function(){
                        										if(!Boss.parentNode){
                        											clearInterval(timer);
                        										}else{
                        											Boss.style.left = Math.floor(Math.random()*301) + 'px';
                        										}
                        									},3000);
                        								});
                        							});
                        						});
                        					});
                    					});
                    				});
                    			});
                    		});
                    	});
                    }
                    setTimeout(bossMove, 2000);
                    var mus = setTimeout(function(){
                            BgM.src = 'music/boss_bg2.mp3';
                        },20000);
                    Boss.className = 'Boss';
                    for(var i = 0; i < 3; i++){
                        var oImg = new Image();
                        oImg.src = 'img/Boss/boss_'+name[i]+'.png';
                        oImg.width = width[i];
                        oImg.height = '110';
                        oImg.className = name[i];
                        Boss.appendChild(oImg);
                    }
                    //Boss血条
                    var blood = document.createElement('div');
                    blood.className = 'blood';
                    Boss.appendChild(blood); 
                    //根据难度确定boss伤害
                    switch(index){
                    	case 0:
                    		Boss_damage = 10; //boss掉血
                    		BuSpe = 800; 	//boss子弹频率
                    		break;
                    	case 1:
                    		Boss_damage = 5;
                    		BuSpe = 500;
                    		break;
                    	case 2:
                    		Boss_damage = 1;
                    		BuSpe = 400;
                    		break;
                    	case 3:
                    		Boss_damage = 0.10;
                    		BuSpe = 200;
                    		break;
                    }
                    oP[5].innerHTML = '当前敌军数量：1个';
                    oBox.appendChild(Boss);
                    BossInt = true;

                    //Boss发射子弹
                	function bossBull(){
                		var Boss_bull = new Image();
                    	Boss_bull.src = 'img/Boss/bossGensiseye.png';
                    	Boss_bull.width = 20;
                    	Boss_bull.height = 20;
                    	Boss_bull.className = 'Boss_bull';
                    	Boss_bull.style.left = Boss.offsetLeft + Boss.offsetWidth/2 - 10 + 'px';
                    	Boss_bull.style.top = Boss.offsetTop + Boss.offsetHeight + 'px';
                    	oBox.appendChild(Boss_bull);
                    	//子弹移动
                    	BsBu();
                    	function BsBu(){
                    		//子弹超出消失
                        	if(Boss_bull.offsetTop >= oBox.offsetHeight - Boss_bull.clientHeight){
                        		oBox.removeChild(Boss_bull);
                        	}else{
                        		Boss_bull.timer = requestAnimationFrame(BsBu);
                        	}
                        	Boss_bull.style.top = Boss_bull.offsetTop + 5 + 'px';
                        	//检测敌军子弹和我军飞机
                        	var oPha = oBox.querySelector('.plane');
                        	if(collision(oPha,Boss_bull)&&!isProt){
	                        		clearInterval(oPha.timer);
	                    			BossInt = false;
	                				clearInterval(Boss.bull);  //停止发射子弹
	                    			boomImg(oBox, 'img/boom.png', 40, 60, 'boom', oPha);
	                    			oBox.removeChild(oPha);
	                    			oBox.removeChild(Boss);
	                    			ifEnd = true;
	                    			//游戏结束页面
	                    			GameEnd();
									killEmyNum = 0;								
                        	}
                        	//检测我军子弹和敌军子弹
                        	var oBul = oBox.querySelectorAll('.bull'),
                				bLength = oBul.length;
                			for(var i = 0; i < bLength; i++){
                				//如果发生了碰撞
                				if(oBul[i].parentNode&&Boss_bull.parentNode&&collision(Boss_bull,oBul[i])){
                					var img = boomImg(oBox, 'img/boom.png', 30, 30, 'boom_bull', Boss_bull, 800);
                					oBox.removeChild(Boss_bull);
                					oBox.removeChild(oBul[i]);
                				}
                			}
                        }
                    }
                    Boss.bull = setInterval(bossBull,BuSpe); 

                    //检测我军子弹和boss碰撞
                    function bosstimer(){
                    	var oBul = oBox.querySelectorAll('.bull'),
                    		bLength = oBul.length;
                    	for(var i = 0; i < bLength; i++){
                    		//如果发生了碰撞
                    		if(collision(Boss,oBul[i])){
                    			num --;
                    			cancelAnimationFrame(oBul[i].timer);
                    			oBox.removeChild(oBul[i]);
                    			Boss_blood -= Boss_damage;
                    			//当boss没血的时候
                    			if(Boss_blood <= 0){
                    				BossInt = false;
                    				clearInterval(Boss.bull);  //停止发射子弹
                    				KillBoss = true;  //杀死了boss
                    				//爆炸图
                    				var boom_img = boomImg(oBox, 'img/boom.png', 150, 110, 'boss_boom', Boss, 1000);
                					clearInterval(Boss.timer);
                					oBox.removeChild(Boss);
                					//改变背景音乐
                    				BgM.src = 'music/enemyBoom.mp3';
                    				clearTimeout(mus);

                    				setTimeout(function(){
                    						BgM.src = 'music/BGM1.mp3';
                    						//重新生成小怪
                    						enemy(index);
                    				},1000);
                    			}
                    			blood.style.backgroundSize = Boss_blood+'px 5px';
                    		}
                    	}
                    	//检测我军和boss碰撞
                    	//是否开启保护罩
                    	if(!isProt){
                    		var oPha = oBox.querySelector('.plane');
                    		if(collision(Boss,oPha)){
                    			clearInterval(Plane.timer);
                				clearInterval(Boss.timer);
                				clearInterval(Boss.bull);
                				//创建敌军爆炸后的图片
                                boomImg(oBox, 'img/boom.png', 150, 110, 'boom', Boss);
                                boomImg(oBox, 'img/boom.png', 40, 60, 'boom', oPha);
                                oBox.removeChild(oPha);
                				oBox.removeChild(Boss);
                				ifEnd = true;
                				BoomAud('music/enemyBoom.mp3',1000);
                				BoomAud('music/planeBoom.mp3',3000);

                				//生成结束界面
                				setTimeout(function(){
                					//更改boss出现状态
                					BossInt = false;
                					BgM.src = 'music/BGM1.mp3';
                					clearTimeout(mus);
                					GameEnd();
                				},3000);
                    		}
                    	}
                    } 
                    Boss.timer = setInterval(bosstimer, 30);             
                }
                //判断我军和敌军碰撞
                //是否开启保护罩
                if(!isProt){
                    var oPha = oBox.querySelector('.plane');
                    //console.log("planeblood:"+planeblood);
                    
                    if(collision(oPha,Img)){
                  	//
                    	//setTimeout("planeblood--;", 1500);                  	
                    	//if(planeblood<=0){					//////////////////////////////                    		
	                        clearInterval(oPha.timer);
	                        clearInterval(timer);
	                        enemyNum--;
	                        //创建敌军爆炸后的图片
	                        boomImg(oBox, 'img/boom.png', 30, 50, 'boom', Img);
	                        boomImg(oBox, 'img/boom.png', 40, 60, 'boom', oPha);
	                        oBox.removeChild(oPha);
	                        oBox.removeChild(Img);
	                        ifEnd = true;
	                        BoomAud('music/enemyBoom.mp3',1000);
	                        BoomAud('music/planeBoom.mp3',3000);
	                        if(BossInt){
	                        	var Boss = oBox.querySelector('.Boss');
	                        	clearInterval(Boss.timer);
	                        	clearInterval(Boss.bull);
	                        	oBox.removeChild(Boss);
	                        	BossInt = false;
	                        }
	                        //console.log("planeblood"+planeblood);
	                        //游戏结束页面
	                        GameEnd();
                    	//}									/////////////////////////
                    }
                }
            }

            //碰撞检测
			function collision(obj1,obj2){
				//如果游戏结束，则不再判断碰撞
				if(!ifEnd){
					var T1 = obj1.offsetTop,
					B1 = T1 + obj1.offsetHeight,
					L1 = obj1.offsetLeft,
					R1 = L1 + obj1.offsetWidth,
					T2 = obj2.offsetTop,
					B2 = T2 + obj2.offsetHeight,
					L2 = obj2.offsetLeft,
					R2 = L2 + obj2.offsetWidth;
					return !(B1 < T2 || L1 > R2 || T1 > B2 || R1 < L2);//(不碰撞情况)
				}
			}

			//生成爆炸后的Img
			function boomImg(parent, src, width, height, className, obj, time){
				var newImg = new Image();
				newImg.src = src;
				newImg.width = width;
				newImg.height = height;
				newImg.className = className;
				newImg.style.left = obj.offsetLeft + 'px';
				newImg.style.top = obj.offsetTop + 'px';
				parent.appendChild(newImg);
				time = time?time:600;
				setTimeout(function(){
					parent.removeChild(newImg);
				},time);
				return newImg;
			}

			//清屏
            document.onkeydown = function(eve){
                eve = eve || window.event;
                if(eve.keyCode===32&&!ifEnd&&Full>0){
                    //按空格清屏
                    var enemyNode = oBox.querySelectorAll('.enemy'),
                        eLength = enemyNode.length;
                    for(i = 0; i < eLength; i++){
                        cancelAnimationFrame(enemyNode[i].timer);
                        boomImg(oBox, 'img/boom.png', 40, 60, 'boom', enemyNode[i]);
                        oBox.removeChild(enemyNode[i]);
                    }
                    pzNum+=eLength;
                    enemyNum-=eLength;
                    Full --;
                    //开启保护罩
                    if(!isProt){
                        var oPha = oBox.querySelector('.plane');
                        oPha.className += ' planeP';
                        isProt = true;
                        setTimeout(function(){
                            isProt = false;
                            oPha.className = 'plane';
                        },5000);
                    }
                    BoomAud('music/enemyBoom.mp3',1000);
                    oP[1].innerHTML = '防空求助：剩余'+Full+'次';
                    return false;
                }
                //增加防空求助
                if(eve.keyCode===13&&!ifEnd){
                    Full += 10;                  
                    oP[1].innerHTML = '防空求助：剩余'+Full+'次';
                }
                oP[6].innerHTML = '已消灭敌军数量：'+pzNum+'个';
            };

            //敌军爆炸特效
            function BoomAud(src,time){
            	//敌军爆炸音效
				var aud = document.createElement('audio');
				aud.src = src;
				aud.autoplay = 'autoplay';
				document.body.appendChild(aud);
				setTimeout(function(){
					document.body.removeChild(aud);
				},time);
            };
		}

		enemy(index);
	}

	//匹配数字
	function toNum(str){
		return str.match(/\d/g);
	}

	//生成游戏结束页面
    function GameEnd(){
    	var content = [
        	"发射出的子弹共："+toNum(oP[4].innerHTML).join('')+"颗",
        	"消灭的敌军数量："+toNum(oP[6].innerHTML).join('')+"个",
        	"总分数"+(KillBoss?(+toNum(oP[7].innerHTML).join('')+15000):toNum(oP[7].innerHTML).join(''))+"分"
    	];
    	var newDiv = document.createElement('div');
    	newDiv.className = 'warp';
    	oBox.appendChild(newDiv);

    	var Title = document.createElement('h2');
    	Title.innerHTML = 'Game Over';
    	newDiv.appendChild(Title);
    	//统计分数等
    	for(var i = 0; i < 3; i++){
    		var newChi = document.createElement('div');
    		newChi.innerHTML = content[i];
    		newDiv.appendChild(newChi);
    	}
    	//生成重新开始按钮
    	var newBtn = document.createElement('i');
    	newBtn.innerHTML = '重新开始';
    	//点击事件
    	newBtn.onclick = function(){
    		KillBoss = false;
    		oBox.removeChild(newDiv);
    		//清空所有的p标签的记录
            var innerP = ['当前战斗机：赤炎战斗机','防空求助：剩余'+Full+'次','子弹生成速度：300ms/个','当前子弹个数：0颗','已发射子弹数量：0颗','当前敌军数量：0个','已消灭敌军数量：0个','当前分数：0分'];
            for(i = 0; i < pLength; i++){
                oP[i].innerHTML = innerP[i];
            }
            oBox = document.getElementById('box');
            oMsg = document.getElementById('Msg');
            oP = oMsg.getElementsByTagName('p');
            pLength = oP.length;
            ifEnd = true;   //游戏是否结束
            var BgM = document.getElementById('BgMusic');
			BgM.src = 'music/BGM1.mp3';
			killEmyNum = 0;
            gameInte();
    	};
    	newDiv.appendChild(newBtn);
    }

    //boss移动
    function move(obj, myJson, time, callBack){
		//兼容定时器
		window.requestAnimationFrame = window.requestAnimationFrame || function(a){return setTimeout(a,1000/60);};
		window.cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;
		
		var cVal = {};   //初始值
		var tVal = {};   //目标值
		for(var key in myJson){
			cVal[key] = parseFloat( getStyle(obj,key) );
			tVal[key] = parseFloat( myJson[key] );
		}
		var newDate = new Date();
		m();
		function m(){
			var nowDate = new Date();
			var prop = (nowDate - newDate)/time;
			prop >= 1?prop = 1:requestAnimationFrame(m);
			for(key in myJson){
				if(key === "opacity"){
					var opac = prop*(tVal[key] - cVal[key]);
					obj.style[key] = cVal[key] + opac;
					obj.style.filter = "alpha(opacity="+opac*100+")";
				}else{
					obj.style[key] = cVal[key] + prop*(tVal[key] - cVal[key]) + "px";
				}
			}
			//执行回调
			if(prop == 1){
				callBack && callBack();
			}
		}
	}

	//获取样式
	function getStyle(obj,attr){
		return obj.currentStyle?obj.currentStyle[attr]:getComputedStyle(obj)[attr];
	}

})();