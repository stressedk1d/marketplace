/** Применяет тему до гидратации — без мигания и «сломанного» system-dark. */
export default function ThemeInitScript() {
  const script = `(function(){try{
    var k='vw-theme',m=localStorage.getItem(k);
    if(m==='system'||!m)m='light';
    if(m!=='dark')m='light';
    document.documentElement.setAttribute('data-theme',m);
  }catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
