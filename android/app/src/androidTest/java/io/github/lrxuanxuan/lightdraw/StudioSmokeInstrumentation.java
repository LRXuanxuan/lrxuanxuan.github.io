package io.github.lrxuanxuan.lightdraw;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.os.Bundle;
import android.os.ParcelFileDescriptor;
import android.os.SystemClock;
import android.util.Log;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.accessibility.AccessibilityNodeInfo;
import android.webkit.WebView;

import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/** Runs only in the isolated .debug APK on a disposable CI emulator. */
public final class StudioSmokeInstrumentation extends Instrumentation {
    private static final String TAG = "LightdrawSmoke";
    private static final String PDF = "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAxMDAgMTAwXSAvUmVzb3VyY2VzIDw8ID4+IC9Db250ZW50cyA0IDAgUiA+PgplbmRvYmoKNCAwIG9iago8PCAvTGVuZ3RoIDMzID4+CnN0cmVhbQowLjIgMC40IDAuOCByZwoxMCAxMCA4MCA4MCByZSBmCgplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIxOSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDUgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjMwMQolJUVPRgo=";
    private Activity activity;

    @Override public void onCreate(Bundle arguments) {
        super.onCreate(arguments);
        start();
    }

    @Override public void onStart() {
        Bundle result = new Bundle();
        try {
            Intent launch = new Intent(Intent.ACTION_MAIN);
            launch.setClassName(getTargetContext().getPackageName(),
                    "io.github.lrxuanxuan.lightdraw.MainActivity");
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity = startActivitySync(launch);
            waitForIdleSync();
            awaitReady("drawing-studio.html", "drawingCanvas");
            WebView drawing = currentWebView();
            JSONObject initial = state(drawing,
                    "({origin:location.origin,width:document.documentElement.clientWidth,"
                    + "scroll:document.documentElement.scrollWidth,"
                    + "folded:document.body.classList.contains('reference-hidden'),"
                    + "native:!!window.DrawingDesktop,ready:!document.getElementById('openProject').disabled})");
            require("https://appassets.androidplatform.net".equals(initial.getString("origin")),
                    "Unexpected offline origin: " + initial);
            require(initial.getBoolean("ready") && initial.getBoolean("native"), "Native save bridge is not ready");
            require(initial.getInt("width") <= 1024 && initial.getBoolean("folded"),
                    "Phone reference panel is not initially folded: " + initial);
            require(initial.getInt("scroll") <= initial.getInt("width"), "Phone layout overflows: " + initial);
            record("Offline HTTPS startup, native bridge, phone folding and layout", initial.toString());

            verifyPdf(drawing);

            // Real touch input invokes the application's normal file-input path.
            tapDom(drawing, "#openProject");
            awaitDocumentPicker();
            sendKeyDownUpSync(KeyEvent.KEYCODE_BACK);
            awaitReady("drawing-studio.html", "drawingCanvas");
            require(state(drawing, "({ready:!document.getElementById('openProject').disabled})").getBoolean("ready"),
                    "Cancelling the system file picker left the app disabled");
            record("System open-document dialog and cancellation", "passed");

            verifyExport(drawing);

            tapDom(drawing, "a[href$='color-block-studio.html']");
            awaitReady("color-block-studio.html", "studyTogglePanel");
            WebView study = currentWebView();
            JSONObject studyState = state(study,
                    "({folded:document.getElementById('panel').hidden,"
                    + "svg:document.querySelectorAll('.logo > svg').length,"
                    + "opener:!!window.opener&&!!window.opener.DrawingBridge&&window.opener.DrawingBridge.hasPartner(window),"
                    + "width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})");
            require(studyState.getBoolean("folded"), "Study sidebar did not start folded");
            require(studyState.getInt("svg") == 1, "Updated study SVG logo is missing");
            require(studyState.getBoolean("opener"), "Paired WindowProxy/opener bridge was not preserved");
            require(studyState.getInt("scroll") <= studyState.getInt("width"), "Study layout overflows");
            sendKeyDownUpSync(KeyEvent.KEYCODE_BACK);
            awaitReady("drawing-studio.html", "drawingCanvas");
            record("Two local studios, preserved logo and Android back navigation", studyState.toString());

            result.putString("stream", "\nLIGHTDRAW_SMOKE_OK\n"
                    + "Verified on the CI Android emulator: offline HTTPS assets, actual PDF worker render, "
                    + "system file-picker cancellation, actual document export bytes, compact sidebars, "
                    + "SVG logo and two-studio back navigation. Physical devices and stylus pressure were not tested.\n");
            finish(Activity.RESULT_OK, result);
        } catch (Throwable error) {
            Log.e(TAG, "Smoke failed", error);
            result.putString("stream", "\nLIGHTDRAW_SMOKE_FAILED\n" + Log.getStackTraceString(error));
            finish(Activity.RESULT_CANCELED, result);
        }
    }

    private void verifyPdf(WebView view) throws Exception {
        evaluate(view, "window.__ldPdfSmoke={done:false};(async()=>{try{"
                + "const path='/assets/drawing-studio/vendor/pdfjs/';"
                + "const response=await fetch(path+'pdf.mjs');"
                + "if(!response.ok||!/javascript/.test(response.headers.get('content-type')||''))throw Error('PDF module MIME/load');"
                + "const pdf=await import(path+'pdf.mjs');"
                + "pdf.GlobalWorkerOptions.workerSrc=path+'pdf.worker.mjs';"
                + "const data=Uint8Array.from(atob('" + PDF + "'),c=>c.charCodeAt(0));"
                + "const document=await pdf.getDocument({data,isEvalSupported:false,enableXfa:false}).promise;"
                + "const page=await document.getPage(1),canvas=window.document.createElement('canvas');"
                + "canvas.width=100;canvas.height=100;const ctx=canvas.getContext('2d');"
                + "await page.render({canvasContext:ctx,viewport:page.getViewport({scale:1})}).promise;"
                + "const pixel=Array.from(ctx.getImageData(50,50,1,1).data);"
                + "await document.destroy();window.__ldPdfSmoke={done:true,pixel};"
                + "}catch(error){window.__ldPdfSmoke={done:true,error:String(error)}}})();true");
        JSONObject pdf = awaitState(view, "window.__ldPdfSmoke", "done", 45000);
        require(!pdf.has("error"), "Offline PDF worker/render failed: " + pdf);
        require(Math.abs(pdf.getJSONArray("pixel").getInt(0) - 51) <= 2
                && Math.abs(pdf.getJSONArray("pixel").getInt(1) - 102) <= 2
                && Math.abs(pdf.getJSONArray("pixel").getInt(2) - 204) <= 2
                && pdf.getJSONArray("pixel").getInt(3) == 255,
                "PDF did not render the expected opaque blue square: " + pdf);
        record("PDF.js ES module, real worker and canvas pixel render without network permission", pdf.toString());
    }

    private void verifyExport(WebView view) throws Exception {
        evaluate(view, "window.__ldSaveSmoke={done:false};"
                + "window.DrawingDesktop.save(new Blob(['lightdraw android export smoke\\n'],{type:'text/plain'}),"
                + "'lightdraw-ci-export.txt').then(saved=>{window.__ldSaveSmoke={done:true,saved}})"
                + ".catch(error=>{window.__ldSaveSmoke={done:true,error:String(error)}});true");
        awaitDocumentPicker();
        long end = SystemClock.uptimeMillis() + 10000;
        boolean clicked = false;
        while (SystemClock.uptimeMillis() < end && !clicked) {
            AccessibilityNodeInfo root = getUiAutomation().getRootInActiveWindow();
            AccessibilityNodeInfo save = findText(root, "Save", "保存");
            if (save != null && save.isEnabled()) clicked = save.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            if (!clicked) SystemClock.sleep(150);
        }
        require(clicked, "Could not find the system Save action");
        JSONObject saved = awaitState(view, "window.__ldSaveSmoke", "done", 15000);
        require(!saved.has("error") && saved.optBoolean("saved"), "Native export did not report a successful write: " + saved);
        String exported = shellOutput("cat /sdcard/Download/lightdraw-ci-export.txt");
        require("lightdraw android export smoke\n".equals(exported),
                "Exported bytes do not match the test Blob: " + exported);
        record("System create-document, native chunk writes, close ACK and exported bytes", "passed");
    }

    private String shellOutput(String command) throws Exception {
        // Reads only the synthetic file on this disposable emulator, never a user's files.
        ParcelFileDescriptor pipe = getUiAutomation().executeShellCommand(command);
        try (InputStream input = new ParcelFileDescriptor.AutoCloseInputStream(pipe);
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int count;
            while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
            return new String(output.toByteArray(), StandardCharsets.UTF_8);
        }
    }

    private void awaitReady(String page, String element) throws Exception {
        long end = SystemClock.uptimeMillis() + 30000;
        String last = "no WebView";
        while (SystemClock.uptimeMillis() < end) {
            WebView view = currentWebView();
            if (view != null) {
                JSONObject value = state(view,
                        "({page:location.pathname,found:!!document.getElementById('" + element + "'),"
                        + "loaded:document.readyState==='complete',"
                        + "initialized:location.pathname.endsWith('drawing-studio.html')"
                        + "?!!window.DrawingStudio&&typeof window.DrawingStudio.inspect==='function'"
                        + ":!!window.__APP,"
                        + "busy:document.body?document.body.classList.contains('busy'):true})");
                last = value.toString();
                // DOM elements exist before deferred application scripts have run.
                // DrawingStudio is exposed after sidebar setup and local project loading;
                // the teaching page exposes __APP after study.init().
                if (value.optString("page").endsWith(page) && value.optBoolean("found")
                        && value.optBoolean("loaded") && value.optBoolean("initialized")
                        && !value.optBoolean("busy")) return;
            }
            SystemClock.sleep(150);
        }
        throw new AssertionError("Timed out waiting for " + page + ": " + last);
    }

    private JSONObject awaitState(WebView view, String expression, String flag, long timeout) throws Exception {
        long end = SystemClock.uptimeMillis() + timeout;
        JSONObject value = new JSONObject();
        while (SystemClock.uptimeMillis() < end) {
            value = state(view, expression);
            if (value.optBoolean(flag)) return value;
            SystemClock.sleep(150);
        }
        throw new AssertionError("Timed out waiting for " + expression + ": " + value);
    }

    private void awaitDocumentPicker() throws Exception {
        long end = SystemClock.uptimeMillis() + 10000;
        String last = "no active root";
        while (SystemClock.uptimeMillis() < end) {
            AccessibilityNodeInfo root = getUiAutomation().getRootInActiveWindow();
            if (root != null) {
                last = String.valueOf(root.getPackageName());
                if (last.contains("documentsui")) return;
            }
            SystemClock.sleep(150);
        }
        throw new AssertionError("System document picker did not open; active package: " + last);
    }

    private AccessibilityNodeInfo findText(AccessibilityNodeInfo node, String... wanted) {
        if (node == null) return null;
        String text = String.valueOf(node.getText());
        for (String item : wanted) if (item.equalsIgnoreCase(text)) return node;
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo result = findText(node.getChild(i), wanted);
            if (result != null) return result;
        }
        return null;
    }

    private void tapDom(WebView view, String selector) throws Exception {
        JSONObject box = state(view, "(()=>{const el=document.querySelector(" + JSONObject.quote(selector)
                + ");if(!el)return {};const r=el.getBoundingClientRect();"
                + "return {x:r.x+r.width/2,y:r.y+r.height/2,width:r.width,height:r.height,viewport:innerWidth}})()");
        require(box.optDouble("width") > 0 && box.optDouble("height") > 0, "Tap target is not visible: " + selector);
        int[] location = new int[2];
        AtomicReference<Float> factor = new AtomicReference<>();
        runOnMainSync(() -> { view.getLocationOnScreen(location); factor.set((float) view.getWidth()); });
        float scale = factor.get() / (float) box.getDouble("viewport");
        float x = location[0] + (float) box.getDouble("x") * scale;
        float y = location[1] + (float) box.getDouble("y") * scale;
        long time = SystemClock.uptimeMillis();
        MotionEvent down = MotionEvent.obtain(time, time, MotionEvent.ACTION_DOWN, x, y, 0);
        MotionEvent up = MotionEvent.obtain(time, time + 50, MotionEvent.ACTION_UP, x, y, 0);
        down.setSource(InputDevice.SOURCE_TOUCHSCREEN);
        up.setSource(InputDevice.SOURCE_TOUCHSCREEN);
        try { sendPointerSync(down); sendPointerSync(up); }
        finally { down.recycle(); up.recycle(); }
    }

    private WebView currentWebView() {
        AtomicReference<WebView> value = new AtomicReference<>();
        runOnMainSync(() -> value.set(findWebView(activity.getWindow().getDecorView())));
        return value.get();
    }

    private WebView findWebView(View view) {
        if (!view.isShown()) return null;
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            for (int i = group.getChildCount() - 1; i >= 0; i--) {
                WebView child = findWebView(group.getChildAt(i));
                if (child != null) return child;
            }
        }
        return view instanceof WebView ? (WebView) view : null;
    }

    private JSONObject state(WebView view, String expression) throws Exception {
        Object decoded = new JSONTokener(evaluate(view, "JSON.stringify(" + expression + ")")).nextValue();
        if (decoded instanceof String) return new JSONObject((String) decoded);
        if (decoded instanceof JSONObject) return (JSONObject) decoded;
        return new JSONObject();
    }

    private String evaluate(WebView view, String script) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> answer = new AtomicReference<>("null");
        runOnMainSync(() -> view.evaluateJavascript(script, result -> { answer.set(result); latch.countDown(); }));
        require(latch.await(8, TimeUnit.SECONDS), "WebView JavaScript evaluation timed out");
        return answer.get();
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    private void record(String name, String value) {
        Log.i(TAG, name + ": " + value);
        Bundle status = new Bundle();
        status.putString("stream", "PASS: " + name + ": " + value + "\n");
        sendStatus(0, status);
    }
}
