(function(){
  const rows = document.querySelectorAll(".inRow");
  const elm = document.querySelector("#interestEl");
  const form = document.querySelector('.form');
  const mk = document.querySelector('.loadMk');
  const sub = document.querySelector('#submit');
  const toast = document.querySelector('.layer-toast');
  const inTxt = toast.querySelector('span');
  let timer = null;
  document.querySelectorAll("[data-id]").forEach((child)=>{
    const id = child.dataset.id;
    const name = child.dataset.name;
    child.addEventListener("click",function(){
      form.reset();
      document.querySelector("#businessType").value = name;
      document.querySelectorAll('.error').forEach((child)=>{child.classList.remove('error');});
      if(id){
        rows[0].style.display="grid";
        rows[1].style.display="grid";
        fetch("/cn/contact?getInterestProduct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            business_id: id
          })
        }).then(response => response.json())
          .then(data => {
            let str = getStr(data.data);
            elm.innerHTML = str;
          })
      }else{
        rows[0].style.display="none";
        rows[1].style.display="none";
      }
    })
  });
  sub.addEventListener("click",function(){
    var formData = new FormData(form);
    mk.classList.add('active');
    fetch("/cn/contact?feedback", {
      method: "POST",
      body: formData
    }).then(response => response.json())
      .then(data => {
        clearTimeout(timer);
        mk.classList.remove('active');
        document.querySelectorAll('.error').forEach((child)=>{child.classList.remove('error');});
        if(data.code==0){
          let errorArr = data.field_error;
          errorArr.forEach((child)=>{
            document.querySelector('input[name="'+child+'"]').parentElement.classList.add('error');
          });
        }else{
          form.reset();
        }
        console.log(data.message);
        inTxt.innerHTML = data.message;
        toast.classList.add('on');
        timer = setTimeout(function(){
          toast.classList.remove("on");
        },2500);
      })
  })
  function getStr(arr){
    let str = '';
    for (let key in arr) {
      if(key==0){
        str+='<div class="layer-type on">\n' +
          '      <input class="chk" checked type="radio" name="interestProduct" value="'+arr[key]+'">\n' +
          '<div class="input__box">\n' +
          '        <div class="txt"><a class="f-20 black">'+arr[key]+'</a></div>\n' +
          '        <div class="layer-icon"><i class="iconfont f-12">&#xe68f;</i></div>\n' +
          '</div>\n' +
          '    </div>'
      }else{
        str+='<div class="layer-type">\n' +
          '      <input class="chk" type="radio" name="interestProduct" value="'+arr[key]+'">\n' +
          '<div class="input__box">\n' +
          '        <div class="txt"><a class="f-20 black">'+arr[key]+'</a></div>\n' +
          '        <div class="layer-icon"><i class="iconfont f-12">&#xe68f;</i></div>\n' +
          '</div>\n' +
          '    </div>'
      }

    }
    return str;
  }
})()