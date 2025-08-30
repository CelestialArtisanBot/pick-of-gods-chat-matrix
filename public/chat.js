if(msg.type==='image'){
  const wrapper=document.createElement('div'); wrapper.className='image-wrapper';
  msg.content.forEach((src,i)=>{
    const item=document.createElement('div'); item.className='carousel-item';
    const img=document.createElement('img'); img.src=src;
    const btn=document.createElement('button'); btn.textContent='↻';
    btn.onclick=async()=>{
      const newImgs=await fetchImagesFromWorker(msg.prompt,msg.count);
      img.src=newImgs[i]||newImgs[0];
    };
    item.appendChild(img);
    item.appendChild(btn);
    wrapper.appendChild(item);
  });
  div.appendChild(wrapper);
} else {
  div.innerHTML=`<pre>${msg.content}</pre>`;
  div.onclick=()=>copyToClipboard(msg.content);
}
