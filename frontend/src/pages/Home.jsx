import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  const cards = [
    {
      title: "Create Decision",
      icon: "➕",
      route: "/create-decision"
    },
    {
      title: "My Decisions",
      icon: "📊",
      route: "/decisions"
    },
    {
      title: "Active Polls",
      icon: "🗳",
      route: "/polls"
    },
    {
      title: "Communities",
      icon: "👥",
      route: "/communities"
    },
    {
      title: "Analytics",
      icon: "📈",
      route: "/analytics"
    },
    {
      title: "Profile",
      icon: "👤",
      route: "/profile"
    }
  ];

  return (
    <>
      <style>{`

      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
        font-family:Arial;
      }

      body{
        background:linear-gradient(135deg,#2563eb,#7c3aed);
      }

      .dashboard{

        min-height:100vh;
        padding:40px;
        color:white;

      }

      .navbar{

        display:flex;
        justify-content:space-between;
        align-items:center;

      }

      .logo{

        font-size:32px;
        font-weight:bold;

      }

      .profile{

        display:flex;
        gap:20px;
        align-items:center;
        font-size:20px;

      }

      .welcome{

        margin-top:40px;

      }

      .welcome h1{

        font-size:40px;

      }

      .welcome p{

        margin-top:10px;
        opacity:.9;

      }

      .grid{

        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
        gap:25px;
        margin-top:45px;

      }

      .card{

        background:rgba(255,255,255,.15);
        backdrop-filter:blur(12px);
        border-radius:20px;
        padding:30px;
        cursor:pointer;
        transition:.3s;
        border:1px solid rgba(255,255,255,.2);

      }

      .card:hover{

        transform:translateY(-8px);
        background:rgba(255,255,255,.25);

      }

      .icon{

        font-size:45px;

      }

      .card h2{

        margin-top:20px;
        font-size:24px;

      }

      .recent{

        margin-top:55px;

      }

      .recent h2{

        margin-bottom:20px;

      }

      .decision{

        background:rgba(255,255,255,.12);
        padding:18px;
        border-radius:15px;
        display:flex;
        justify-content:space-between;
        margin-bottom:15px;
        align-items:center;

      }

      .status{

        background:#10b981;
        padding:6px 14px;
        border-radius:20px;

      }

      button{

        background:white;
        color:#2563eb;
        border:none;
        padding:8px 18px;
        border-radius:10px;
        cursor:pointer;
        font-weight:bold;

      }

      `}</style>

      <div className="dashboard">

        <div className="navbar">

          <div className="logo">
            DecisionHub
          </div>

          <div className="profile">
            🔔
            👤
          </div>

        </div>

        <div className="welcome">

          <h1>Welcome Back 👋</h1>

          <p>
            Create polls, compare ideas and make smarter decisions together.
          </p>

        </div>

        <div className="grid">

          {cards.map((card,index)=>(
            <div
              key={index}
              className="card"
              onClick={()=>navigate(card.route)}
            >

              <div className="icon">
                {card.icon}
              </div>

              <h2>{card.title}</h2>

            </div>
          ))}

        </div>

        <div className="recent">

          <h2>Recent Decisions</h2>

          <div className="decision">

            <div>
              <h3>MBA vs Job</h3>
            </div>

            <div className="status">
              Active
            </div>

            <button>View</button>

          </div>

          <div className="decision">

            <div>
              <h3>iPhone vs Samsung</h3>
            </div>

            <div className="status">
              Active
            </div>

            <button>View</button>

          </div>

          <div className="decision">

            <div>
              <h3>Goa vs Bali</h3>
            </div>

            <div className="status">
              Active
            </div>

            <button>View</button>

          </div>

        </div>

      </div>

    </>
  );
}

export default Home;