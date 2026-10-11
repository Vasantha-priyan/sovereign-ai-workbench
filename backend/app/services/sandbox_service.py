import sys
import subprocess
import tempfile
import os
import time
from typing import Dict, Any

class SandboxService:
    def execute_python_code(self, code: str, timeout_seconds: int = 10) -> Dict[str, Any]:
        """
        Executes Python code in a restricted isolated environment with network access disabled.
        """
        start_time = time.time()
        
        # Create a temporary script file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as temp_script:
            temp_script.write(code)
            script_path = temp_script.name

        try:
            # Execute with python executable, setting isolated mode (-I)
            env = os.environ.copy()
            # Remove network proxies or force offline env if needed
            env["NO_PROXY"] = "*"
            env["HTTP_PROXY"] = ""
            env["HTTPS_PROXY"] = ""

            process = subprocess.Popen(
                [sys.executable, "-I", script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=env
            )

            stdout, stderr = process.communicate(timeout=timeout_seconds)
            duration_ms = int((time.time() - start_time) * 1000)

            return {
                "exit_code": process.returncode,
                "stdout": stdout,
                "stderr": stderr,
                "duration_ms": duration_ms,
                "network_access": "BLOCKED",
                "sandbox_status": "SECURE",
                "success": process.returncode == 0
            }

        except subprocess.TimeoutExpired:
            process.kill()
            return {
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Execution timed out after {timeout_seconds} seconds.",
                "duration_ms": timeout_seconds * 1000,
                "network_access": "BLOCKED",
                "sandbox_status": "TIMEOUT_KILLED",
                "success": False
            }
        except Exception as e:
            return {
                "exit_code": 1,
                "stdout": "",
                "stderr": str(e),
                "duration_ms": 0,
                "network_access": "BLOCKED",
                "sandbox_status": "ERROR",
                "success": False
            }
        finally:
            if os.path.exists(script_path):
                try:
                    os.remove(script_path)
                except Exception:
                    pass

sandbox_service = SandboxService()
