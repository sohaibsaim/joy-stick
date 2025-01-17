class JoystickController {
    constructor(stickID, maxDistance, deadzone) {
        this.id = stickID;
        let stick = document.getElementById(stickID);

        this.dragStart = null;
        this.touchId = null;
        this.active = false;
        this.value = { x: 0, y: 0 };

        let self = this;

        function handleDown(event) {
            self.active = true;
            stick.style.transition = '0s';
            event.preventDefault();

            const touch = event.changedTouches ? event.changedTouches[0] : event;
            self.dragStart = { x: touch.clientX, y: touch.clientY };

            if (event.changedTouches) {
                self.touchId = touch.identifier;
            }
        }

        function handleMove(event) {
            if (!self.active) return;

            let touch = null;
            if (event.changedTouches) {
                for (let i = 0; i < event.changedTouches.length; i++) {
                    if (self.touchId === event.changedTouches[i].identifier) {
                        touch = event.changedTouches[i];
                        break;
                    }
                }
                if (!touch) return; // Ignore if this touch isn't the joystick
            } else {
                touch = event;
            }

            const xDiff = touch.clientX - self.dragStart.x;
            const yDiff = touch.clientY - self.dragStart.y;
            const angle = Math.atan2(yDiff, xDiff);
            const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
            const xPosition = distance * Math.cos(angle);
            const yPosition = distance * Math.sin(angle);

            stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

            const distance2 = (distance < deadzone) ? 0 : maxDistance / (maxDistance - deadzone) * (distance - deadzone);
            const xPosition2 = distance2 * Math.cos(angle);
            const yPosition2 = distance2 * Math.sin(angle);
            self.value = {
                x: parseFloat((xPosition2 / maxDistance).toFixed(4)),
                y: parseFloat((yPosition2 / maxDistance).toFixed(4))
            };
        }

        function handleUp(event) {
            if (!self.active) return;

            if (event.changedTouches && self.touchId !== event.changedTouches[0].identifier) return;

            stick.style.transition = '.2s';
            stick.style.transform = `translate3d(0px, 0px, 0px)`;

            self.value = { x: 0, y: 0 };
            self.touchId = null;
            self.active = false;
        }

        stick.addEventListener('pointerdown', handleDown);
        document.addEventListener('pointermove', handleMove);
        document.addEventListener('pointerup', handleUp);
    }
}

let joystick = new JoystickController("stick1", 64, 8);

// Handle button actions
document.getElementById('dive').addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    alert("Dive action triggered!");
});

document.getElementById('use').addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    alert("Use action triggered!");
});

function update() {
    console.log("Joystick Position:", joystick.value);
}

function loop() {
    requestAnimationFrame(loop);
    update();
}

loop();
