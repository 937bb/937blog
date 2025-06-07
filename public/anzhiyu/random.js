var posts=["2025/06/06/Docker常用命令1/","2025/06/06/GIT常用命令1/","2025/06/06/Linxu常用命令1/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };