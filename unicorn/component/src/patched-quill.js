// patched-quill.js
import Quill from 'quill';

// Patch the Scroll class to use MutationObserver instead of DOMNodeInserted
if (Quill.imports && Quill.imports.blots && Quill.imports.blots.scroll) {
  const originalInit = Quill.imports.blots.scroll.prototype.init;
  
  Quill.imports.blots.scroll.prototype.init = function() {
    originalInit.call(this);
    
    // Remove any existing DOMNodeInserted listeners
    if (this.domNode && this.domNode.removeEventListener) {
      this.domNode.removeEventListener('DOMNodeInserted', () => {});
    }
    
    // Use MutationObserver instead
    if (typeof MutationObserver !== 'undefined' && this.domNode) {
      this.observer = new MutationObserver((mutations) => {
        if (mutations.some(m => m.type === 'childList' && m.addedNodes.length > 0)) {
          this.update();
        }
      });
      
      this.observer.observe(this.domNode, {
        childList: true,
        subtree: true
      });
      
      // Clean up on destroy
      const originalDestroy = this.destroy;
      this.destroy = function() {
        if (this.observer) {
          this.observer.disconnect();
          delete this.observer;
        }
        originalDestroy.call(this);
      };
    }
  };
}

export default Quill;
