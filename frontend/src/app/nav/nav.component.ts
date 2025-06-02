  styles: [`
    nav {
      width: 100vw;
      height: 10vh;
      background: #55FFA3;
      border-bottom: 1px solid #2EFB67;
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2em;
      box-sizing: border-box;
    }

    .logo {
      height: 100%;
      display: flex;
      align-items: center;
      gap: 1em;
    }

    .logo img {
      height: 80%;
    }

    .logo h1 {
      color: #04286D;
      font-size: 2em;
      margin: 0;
    }

    .nav-links {
      display: flex;
      gap: 2em;
      align-items: center;
    }

    .nav-links a {
      color: #04286D;
      text-decoration: none;
      font-size: 1.2em;
      transition: color 0.2s;
    }

    .nav-links a:hover {
      color: #0056b3;
    }

    .nav-links button {
      background: none;
      border: none;
      color: #04286D;
      font-size: 1.2em;
      cursor: pointer;
      transition: color 0.2s;
    }

    .nav-links button:hover {
      color: #0056b3;
    }
  `] 