import { Link, useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
          font-family:'Segoe UI',sans-serif;
        }

        body{
          overflow:hidden;
        }

        .container{
          position:relative;
          width:100%;
          height:100vh;
          display:flex;
          justify-content:center;
          align-items:center;
          overflow:hidden;
          background:linear-gradient(-45deg,#24195d,#3d2fb5,#566cff,#24195d);
          background-size:400% 400%;
          animation:bgMove 12s ease infinite;
        }

        .blob{
          position:absolute;
          border-radius:50%;
          filter:blur(20px);
          opacity:.45;
          animation:float 8s ease-in-out infinite;
        }

        .blob1{
          width:280px;
          height:280px;
          background:#9d8dff;
          top:-60px;
          left:-60px;
        }

        .blob2{
          width:220px;
          height:220px;
          background:#00d4ff;
          right:-60px;
          bottom:-60px;
          animation-delay:2s;
        }

        .blob3{
          width:160px;
          height:160px;
          background:#ff4fa5;
          bottom:140px;
          left:18%;
          animation-delay:4s;
        }

        .card{
          position:relative;
          width:700px;
          padding:70px;
          text-align:center;
          border-radius:30px;
          background:rgba(255,255,255,.12);
          backdrop-filter:blur(18px);
          border:1px solid rgba(255,255,255,.2);
          box-shadow:0 20px 60px rgba(0,0,0,.35);
          z-index:10;
        }

        .search{
          width:130px;
          height:130px;
          margin:auto;
          border-radius:50%;
          background:white;
          display:flex;
          justify-content:center;
          align-items:center;
          font-size:55px;
          animation:pulse 2.5s infinite;
          box-shadow:0 0 35px rgba(255,255,255,.5);
        }

        .code{
          margin-top:30px;
          display:flex;
          justify-content:center;
          gap:15px;
        }

        .digit{
          font-size:120px;
          font-weight:bold;
          color:white;
          animation:bounce 2s infinite;
          text-shadow:0 0 25px rgba(255,255,255,.45);
        }

        .digit:nth-child(2){
          animation-delay:.3s;
        }

        .digit:nth-child(3){
          animation-delay:.6s;
        }

        h2{
          margin-top:15px;
          color:white;
          font-size:38px;
        }

        p{
          color:#ececec;
          margin-top:18px;
          font-size:18px;
          line-height:1.7;
        }

        .buttons{
          margin-top:40px;
          display:flex;
          justify-content:center;
          gap:20px;
        }

        button,a{
          padding:15px 34px;
          border:none;
          border-radius:14px;
          cursor:pointer;
          font-size:16px;
          font-weight:600;
          text-decoration:none;
          transition:.35s;
        }

        .back{
          background:white;
          color:#3d2fb5;
        }

        .home{
          background:#6f63ff;
          color:white;
        }

        .back:hover,
        .home:hover{
          transform:translateY(-6px);
          box-shadow:0 12px 30px rgba(0,0,0,.3);
        }

        .ring{
          position:absolute;
          width:170px;
          height:170px;
          border:2px solid rgba(255,255,255,.2);
          border-radius:50%;
          left:50%;
          transform:translateX(-50%);
          top:48px;
          animation:rotate 12s linear infinite;
        }

        .ring::before{
          content:"";
          width:18px;
          height:18px;
          background:white;
          border-radius:50%;
          position:absolute;
          top:-9px;
          left:50%;
          transform:translateX(-50%);
        }

        @keyframes bgMove{
          0%{background-position:0% 50%;}
          50%{background-position:100% 50%;}
          100%{background-position:0% 50%;}
        }

        @keyframes float{
          0%,100%{
            transform:translateY(0px);
          }
          50%{
            transform:translateY(-35px);
          }
        }

        @keyframes bounce{
          0%,100%{
            transform:translateY(0);
          }
          50%{
            transform:translateY(-15px);
          }
        }

        @keyframes pulse{
          0%,100%{
            transform:scale(1);
          }
          50%{
            transform:scale(1.08);
          }
        }

        @keyframes rotate{
          from{
            transform:translateX(-50%) rotate(0deg);
          }
          to{
            transform:translateX(-50%) rotate(360deg);
          }
        }

      `}</style>

      <div className="container">

        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>

        <div className="card">

          <div className="ring"></div>

          <div className="search">
            🔍
          </div>

          <div className="code">
            <div className="digit">4</div>
            <div className="digit">0</div>
            <div className="digit">4</div>
          </div>

          <h2>Oops! URL Not Found</h2>

          <p>
            The page you're looking for doesn't exist, may have been moved,
            or the URL you entered is incorrect.
          </p>

          <div className="buttons">

            <button
              className="back"
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>

          </div>

        </div>

      </div>
    </>
  );
}

export default NotFound;